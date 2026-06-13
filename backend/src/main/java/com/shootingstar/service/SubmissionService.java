package com.shootingstar.service;

import com.shootingstar.dto.judge.JudgeResultResponse;
import com.shootingstar.dto.submission.SubmissionResponse;
import com.shootingstar.dto.submission.SubmitRequest;
import com.shootingstar.dto.submission.UpdateScoreRequest;
import com.shootingstar.entity.*;
import com.shootingstar.repository.*;
import com.shootingstar.security.UserPrincipal;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class SubmissionService {

    private final SubmissionRepository submissionRepository;
    private final AssignmentRepository assignmentRepository;
    private final UserRepository userRepository;
    private final CourseEnrollmentRepository courseEnrollmentRepository;
    private final JudgeResultRepository judgeResultRepository;
    private final JudgeService judgeService;

    public SubmissionService(SubmissionRepository submissionRepository,
                             AssignmentRepository assignmentRepository,
                             UserRepository userRepository,
                             CourseEnrollmentRepository courseEnrollmentRepository,
                             JudgeResultRepository judgeResultRepository,
                             JudgeService judgeService) {
        this.submissionRepository = submissionRepository;
        this.assignmentRepository = assignmentRepository;
        this.userRepository = userRepository;
        this.courseEnrollmentRepository = courseEnrollmentRepository;
        this.judgeResultRepository = judgeResultRepository;
        this.judgeService = judgeService;
    }

    public SubmissionResponse submit(UserPrincipal principal, UUID assignmentId, SubmitRequest req) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Assignment not found"));

        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));

        CourseRole role = getCourseRole(assignment.getCourse(), user);
        if (role != CourseRole.STUDENT) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only students can submit");
        }

        if (!assignment.getDeadlineAt().isAfter(OffsetDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Deadline has passed");
        }

        SubmissionType type = assignment.getSubmissionType();
        if (type == SubmissionType.CODE) {
            if (req.getLanguage() == null || req.getLanguage().isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Language is required for CODE submission");
            }
            if (req.getCodeContent() == null || req.getCodeContent().isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Code content is required for CODE submission");
            }
        } else if (type == SubmissionType.FILE) {
            if (req.getFileUrl() == null || req.getFileUrl().isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File URL is required for FILE submission");
            }
        } else if (type == SubmissionType.REPORT) {
            if (req.getReportContent() == null || req.getReportContent().isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Report content is required for REPORT submission");
            }
        }

        Submission submission = new Submission();
        submission.setAssignment(assignment);
        submission.setUser(user);
        submission.setLanguage(req.getLanguage());
        submission.setCodeContent(req.getCodeContent());
        submission.setFileUrl(req.getFileUrl());
        submission.setReportContent(req.getReportContent());
        submission.setSubmittedAt(OffsetDateTime.now());
        submission.setReturned(false);
        submission.setScore(0);

        Submission saved = submissionRepository.save(submission);

        if (type == SubmissionType.CODE) {
            judgeService.judgeSubmission(saved);
        }

        return toResponse(saved, false);
    }

    @Transactional(readOnly = true)
    public List<SubmissionResponse> getSubmissions(UserPrincipal principal, UUID assignmentId) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Assignment not found"));

        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));

        CourseRole role = getCourseRole(assignment.getCourse(), user);

        if (role == CourseRole.TEACHER || role == CourseRole.TA) {
            return submissionRepository.findByAssignment(assignment).stream()
                    .map(s -> toResponse(s, false))
                    .collect(Collectors.toList());
        }

        return submissionRepository.findByAssignmentAndUser(assignment, user).stream()
                .map(s -> toResponse(s, !s.isReturned()))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SubmissionResponse getSubmission(UserPrincipal principal, UUID submissionId) {
        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Submission not found"));

        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));

        CourseRole role = getCourseRole(submission.getAssignment().getCourse(), user);

        if (role == CourseRole.STUDENT) {
            if (!submission.getUser().getId().equals(principal.getId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN);
            }
            return toResponse(submission, !submission.isReturned());
        }

        return toResponse(submission, false);
    }

    public SubmissionResponse updateScore(UserPrincipal principal, UUID submissionId, UpdateScoreRequest req) {
        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Submission not found"));

        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));

        CourseRole role = getCourseRole(submission.getAssignment().getCourse(), user);
        if (role != CourseRole.TEACHER && role != CourseRole.TA) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }

        submission.setScore(req.getScore());
        Submission saved = submissionRepository.save(submission);
        return toResponse(saved, false);
    }

    public List<SubmissionResponse> returnSubmissions(UserPrincipal principal, UUID assignmentId) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Assignment not found"));

        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));

        CourseRole role = getCourseRole(assignment.getCourse(), user);
        if (role != CourseRole.TEACHER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only teachers can return submissions");
        }

        List<Submission> allSubmissions = submissionRepository.findByAssignment(assignment);

        Map<UUID, Submission> latestPerUser = new LinkedHashMap<>();
        for (Submission s : allSubmissions) {
            UUID userId = s.getUser().getId();
            if (!latestPerUser.containsKey(userId)
                    || s.getSubmittedAt().isAfter(latestPerUser.get(userId).getSubmittedAt())) {
                latestPerUser.put(userId, s);
            }
        }

        OffsetDateTime now = OffsetDateTime.now();
        List<Submission> toReturn = new ArrayList<>(latestPerUser.values());
        for (Submission s : toReturn) {
            s.setReturned(true);
            s.setReturnedAt(now);
            submissionRepository.save(s);
        }

        return toReturn.stream()
                .map(s -> toResponse(s, false))
                .collect(Collectors.toList());
    }

    private CourseRole getCourseRole(Course course, User user) {
        if (course.getOwner().getId().equals(user.getId())) {
            return CourseRole.TEACHER;
        }
        return courseEnrollmentRepository.findByCourseAndUser(course, user)
                .map(CourseEnrollment::getRole)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Not enrolled in this course"));
    }

    private SubmissionResponse toResponse(Submission submission, boolean hidePrivateData) {
        SubmissionResponse resp = new SubmissionResponse();
        resp.setId(submission.getId());
        resp.setAssignmentId(submission.getAssignment().getId());
        resp.setAssignmentTitle(submission.getAssignment().getTitle());
        resp.setUserId(submission.getUser().getId());
        resp.setUserName(submission.getUser().getName());
        resp.setLanguage(submission.getLanguage());
        resp.setCodeContent(submission.getCodeContent());
        resp.setFileUrl(submission.getFileUrl());
        resp.setReportContent(submission.getReportContent());
        resp.setSubmittedAt(submission.getSubmittedAt());
        resp.setReturned(submission.isReturned());
        resp.setReturnedAt(submission.getReturnedAt());

        if (hidePrivateData) {
            resp.setScore(null);
            resp.setJudgeResults(Collections.emptyList());
        } else {
            resp.setScore(submission.getScore());
            List<JudgeResultResponse> judgeResults = judgeResultRepository.findBySubmission(submission).stream()
                    .map(jr -> new JudgeResultResponse(
                            jr.getId(),
                            jr.getSubmission().getId(),
                            jr.getTestCase().getId(),
                            jr.getStatus().name(),
                            jr.getExecutionTimeMs(),
                            jr.getMemoryKb(),
                            jr.getCreatedAt()
                    ))
                    .collect(Collectors.toList());
            resp.setJudgeResults(judgeResults);
        }

        return resp;
    }
}

package com.shootingstar.service;

import com.shootingstar.dto.assignment.*;
import com.shootingstar.entity.*;
import com.shootingstar.repository.*;
import com.shootingstar.security.UserPrincipal;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class AssignmentService {

    private final AssignmentRepository assignmentRepository;
    private final AssignmentLanguageRepository assignmentLanguageRepository;
    private final TestCaseRepository testCaseRepository;
    private final CourseRepository courseRepository;
    private final CourseEnrollmentRepository courseEnrollmentRepository;
    private final UserRepository userRepository;

    public AssignmentService(
            AssignmentRepository assignmentRepository,
            AssignmentLanguageRepository assignmentLanguageRepository,
            TestCaseRepository testCaseRepository,
            CourseRepository courseRepository,
            CourseEnrollmentRepository courseEnrollmentRepository,
            UserRepository userRepository) {
        this.assignmentRepository = assignmentRepository;
        this.assignmentLanguageRepository = assignmentLanguageRepository;
        this.testCaseRepository = testCaseRepository;
        this.courseRepository = courseRepository;
        this.courseEnrollmentRepository = courseEnrollmentRepository;
        this.userRepository = userRepository;
    }

    public AssignmentResponse createAssignment(UserPrincipal principal, UUID courseId, CreateAssignmentRequest req) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));
        User user = findUserOrThrow(principal);
        CourseRole role = getCourseRole(course, user);
        if (role != CourseRole.TEACHER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }

        Assignment assignment = new Assignment();
        assignment.setCourse(course);
        assignment.setTitle(req.getTitle());
        assignment.setDescription(req.getDescription());
        assignment.setSubmissionType(req.getSubmissionType());
        assignment.setIsPublished(req.getIsPublished() != null ? req.getIsPublished() : false);
        assignment.setPublishAt(req.getPublishAt());
        assignment.setDeadlineAt(req.getDeadlineAt());
        assignment.setMaxScore(req.getMaxScore());

        Assignment saved = assignmentRepository.save(assignment);

        if (req.getSubmissionType() == SubmissionType.CODE
                && req.getLanguages() != null
                && !req.getLanguages().isEmpty()) {
            for (String lang : req.getLanguages()) {
                AssignmentLanguage al = new AssignmentLanguage();
                al.setAssignment(saved);
                al.setLanguage(lang);
                assignmentLanguageRepository.save(al);
            }
        }

        return toAssignmentResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<AssignmentResponse> getAssignments(UserPrincipal principal, UUID courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));
        User user = findUserOrThrow(principal);
        CourseRole role = getCourseRole(course, user);
        if (role == null) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }

        List<Assignment> assignments;
        if (role == CourseRole.TEACHER || role == CourseRole.TA) {
            assignments = assignmentRepository.findByCourse(course);
        } else {
            OffsetDateTime now = OffsetDateTime.now();
            assignments = assignmentRepository.findByCourse(course).stream()
                    .filter(a -> a.getIsPublished()
                            && (a.getPublishAt() == null || !a.getPublishAt().isAfter(now)))
                    .collect(Collectors.toList());
        }

        return assignments.stream()
                .map(this::toAssignmentResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AssignmentResponse getAssignment(UserPrincipal principal, UUID assignmentId) {
        Assignment assignment = findAssignmentOrThrow(assignmentId);
        User user = findUserOrThrow(principal);
        CourseRole role = getCourseRole(assignment.getCourse(), user);
        if (role == null) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }
        if (role == CourseRole.STUDENT) {
            OffsetDateTime now = OffsetDateTime.now();
            boolean visible = assignment.getIsPublished()
                    && (assignment.getPublishAt() == null || !assignment.getPublishAt().isAfter(now));
            if (!visible) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN);
            }
        }
        return toAssignmentResponse(assignment);
    }

    public AssignmentResponse updateAssignment(UserPrincipal principal, UUID assignmentId, UpdateAssignmentRequest req) {
        Assignment assignment = findAssignmentOrThrow(assignmentId);
        User user = findUserOrThrow(principal);
        CourseRole role = getCourseRole(assignment.getCourse(), user);
        if (role != CourseRole.TEACHER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }

        if (req.getTitle() != null) assignment.setTitle(req.getTitle());
        if (req.getDescription() != null) assignment.setDescription(req.getDescription());
        if (req.getSubmissionType() != null) assignment.setSubmissionType(req.getSubmissionType());
        if (req.getIsPublished() != null) assignment.setIsPublished(req.getIsPublished());
        if (req.getPublishAt() != null) assignment.setPublishAt(req.getPublishAt());
        if (req.getDeadlineAt() != null) assignment.setDeadlineAt(req.getDeadlineAt());
        if (req.getMaxScore() != null) assignment.setMaxScore(req.getMaxScore());

        if (req.getLanguages() != null) {
            assignmentLanguageRepository.deleteByAssignment(assignment);
            for (String lang : req.getLanguages()) {
                AssignmentLanguage al = new AssignmentLanguage();
                al.setAssignment(assignment);
                al.setLanguage(lang);
                assignmentLanguageRepository.save(al);
            }
        }

        Assignment saved = assignmentRepository.save(assignment);
        return toAssignmentResponse(saved);
    }

    public AssignmentResponse publishAssignment(UserPrincipal principal, UUID assignmentId, PublishAssignmentRequest req) {
        Assignment assignment = findAssignmentOrThrow(assignmentId);
        User user = findUserOrThrow(principal);
        CourseRole role = getCourseRole(assignment.getCourse(), user);
        if (role != CourseRole.TEACHER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }

        assignment.setIsPublished(req.getIsPublished());
        assignment.setPublishAt(req.getPublishAt());

        Assignment saved = assignmentRepository.save(assignment);
        return toAssignmentResponse(saved);
    }

    public TestCaseResponse createTestCase(UserPrincipal principal, UUID assignmentId, CreateTestCaseRequest req) {
        Assignment assignment = findAssignmentOrThrow(assignmentId);
        User user = findUserOrThrow(principal);
        CourseRole role = getCourseRole(assignment.getCourse(), user);
        if (role != CourseRole.TEACHER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }

        TestCase testCase = new TestCase();
        testCase.setAssignment(assignment);
        testCase.setInput(req.getInput());
        testCase.setExpectedOutput(req.getExpectedOutput());
        testCase.setScore(req.getScore());

        if (req.getOrderIndex() != null) {
            testCase.setOrderIndex(req.getOrderIndex());
        } else {
            int count = testCaseRepository.findByAssignmentOrderByOrderIndexAsc(assignment).size();
            testCase.setOrderIndex(count);
        }

        TestCase saved = testCaseRepository.save(testCase);
        return toTestCaseResponse(saved);
    }

    public TestCaseResponse updateTestCase(UserPrincipal principal, UUID testCaseId, UpdateTestCaseRequest req) {
        TestCase testCase = testCaseRepository.findById(testCaseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "TestCase not found"));
        User user = findUserOrThrow(principal);
        CourseRole role = getCourseRole(testCase.getAssignment().getCourse(), user);
        if (role != CourseRole.TEACHER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }

        if (req.getInput() != null) testCase.setInput(req.getInput());
        if (req.getExpectedOutput() != null) testCase.setExpectedOutput(req.getExpectedOutput());
        if (req.getScore() != null) testCase.setScore(req.getScore());
        if (req.getOrderIndex() != null) testCase.setOrderIndex(req.getOrderIndex());

        TestCase saved = testCaseRepository.save(testCase);
        return toTestCaseResponse(saved);
    }

    public void deleteTestCase(UserPrincipal principal, UUID testCaseId) {
        TestCase testCase = testCaseRepository.findById(testCaseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "TestCase not found"));
        User user = findUserOrThrow(principal);
        CourseRole role = getCourseRole(testCase.getAssignment().getCourse(), user);
        if (role != CourseRole.TEACHER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }
        testCaseRepository.delete(testCase);
    }

    @Transactional(readOnly = true)
    public List<TestCaseResponse> getTestCases(UserPrincipal principal, UUID assignmentId) {
        Assignment assignment = findAssignmentOrThrow(assignmentId);
        User user = findUserOrThrow(principal);
        CourseRole role = getCourseRole(assignment.getCourse(), user);
        if (role == null || role == CourseRole.STUDENT) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }
        return testCaseRepository.findByAssignmentOrderByOrderIndexAsc(assignment).stream()
                .map(this::toTestCaseResponse)
                .collect(Collectors.toList());
    }

    private CourseRole getCourseRole(Course course, User user) {
        if (course.getOwner().getId().equals(user.getId())) return CourseRole.TEACHER;
        return courseEnrollmentRepository.findByCourseAndUser(course, user)
                .map(CourseEnrollment::getRole).orElse(null);
    }

    private Assignment findAssignmentOrThrow(UUID assignmentId) {
        return assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Assignment not found"));
    }

    private User findUserOrThrow(UserPrincipal principal) {
        return userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
    }

    private AssignmentResponse toAssignmentResponse(Assignment assignment) {
        List<String> languages = assignmentLanguageRepository.findByAssignment(assignment).stream()
                .map(AssignmentLanguage::getLanguage)
                .collect(Collectors.toList());

        AssignmentResponse res = new AssignmentResponse();
        res.setId(assignment.getId());
        res.setCourseId(assignment.getCourse().getId());
        res.setCourseTitle(assignment.getCourse().getName());
        res.setTitle(assignment.getTitle());
        res.setDescription(assignment.getDescription());
        res.setSubmissionType(assignment.getSubmissionType().name());
        res.setIsPublished(assignment.getIsPublished());
        res.setPublishAt(assignment.getPublishAt());
        res.setDeadlineAt(assignment.getDeadlineAt());
        res.setMaxScore(assignment.getMaxScore());
        res.setLanguages(languages);
        res.setCreatedAt(assignment.getCreatedAt());
        res.setUpdatedAt(assignment.getUpdatedAt());
        return res;
    }

    private TestCaseResponse toTestCaseResponse(TestCase testCase) {
        TestCaseResponse res = new TestCaseResponse();
        res.setId(testCase.getId());
        res.setAssignmentId(testCase.getAssignment().getId());
        res.setInput(testCase.getInput());
        res.setExpectedOutput(testCase.getExpectedOutput());
        res.setScore(testCase.getScore());
        res.setOrderIndex(testCase.getOrderIndex());
        return res;
    }
}

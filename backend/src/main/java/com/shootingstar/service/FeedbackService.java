package com.shootingstar.service;

import com.shootingstar.dto.feedback.CreateFeedbackRequest;
import com.shootingstar.dto.feedback.FeedbackResponse;
import com.shootingstar.dto.feedback.UpdateFeedbackRequest;
import com.shootingstar.entity.Course;
import com.shootingstar.entity.CourseEnrollment;
import com.shootingstar.entity.CourseRole;
import com.shootingstar.entity.FeedbackComment;
import com.shootingstar.entity.Submission;
import com.shootingstar.entity.User;
import com.shootingstar.repository.CourseEnrollmentRepository;
import com.shootingstar.repository.FeedbackCommentRepository;
import com.shootingstar.repository.SubmissionRepository;
import com.shootingstar.repository.UserRepository;
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
public class FeedbackService {

    private final SubmissionRepository submissionRepository;
    private final FeedbackCommentRepository feedbackCommentRepository;
    private final UserRepository userRepository;
    private final CourseEnrollmentRepository courseEnrollmentRepository;

    public FeedbackService(SubmissionRepository submissionRepository,
                           FeedbackCommentRepository feedbackCommentRepository,
                           UserRepository userRepository,
                           CourseEnrollmentRepository courseEnrollmentRepository) {
        this.submissionRepository = submissionRepository;
        this.feedbackCommentRepository = feedbackCommentRepository;
        this.userRepository = userRepository;
        this.courseEnrollmentRepository = courseEnrollmentRepository;
    }

    public FeedbackResponse addFeedback(UserPrincipal principal, UUID submissionId, CreateFeedbackRequest req) {
        Submission submission = findSubmissionOrThrow(submissionId);
        User user = findUserOrThrow(principal);
        Course course = submission.getAssignment().getCourse();
        CourseRole courseRole = getCourseRole(course, user);
        if (courseRole != CourseRole.TEACHER && courseRole != CourseRole.TA) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "TEACHER/TAのみフィードバックを追加できます");
        }
        FeedbackComment comment = new FeedbackComment();
        comment.setSubmission(submission);
        comment.setAuthor(user);
        comment.setStartLine(req.getStartLine());
        comment.setEndLine(req.getEndLine());
        comment.setBody(req.getBody());
        comment.setCreatedAt(OffsetDateTime.now());
        FeedbackComment saved = feedbackCommentRepository.save(comment);
        return toFeedbackResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<FeedbackResponse> getFeedback(UserPrincipal principal, UUID submissionId) {
        Submission submission = findSubmissionOrThrow(submissionId);
        User user = findUserOrThrow(principal);
        Course course = submission.getAssignment().getCourse();
        CourseRole courseRole = getCourseRole(course, user);
        if (courseRole == CourseRole.STUDENT) {
            if (!submission.getUser().getId().equals(principal.getId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "自分の提出のみ閲覧できます");
            }
            if (!submission.isReturned()) {
                return List.of();
            }
        }
        return feedbackCommentRepository.findBySubmission(submission).stream()
                .map(this::toFeedbackResponse)
                .collect(Collectors.toList());
    }

    public FeedbackResponse updateFeedback(UserPrincipal principal, UUID feedbackId, UpdateFeedbackRequest req) {
        FeedbackComment comment = findFeedbackOrThrow(feedbackId);
        User user = findUserOrThrow(principal);
        Course course = comment.getSubmission().getAssignment().getCourse();
        CourseRole courseRole = getCourseRole(course, user);
        boolean isAuthor = comment.getAuthor().getId().equals(user.getId());
        boolean isTeacher = courseRole == CourseRole.TEACHER;
        if (!isAuthor && !isTeacher) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "フィードバックの更新権限がありません");
        }
        comment.setStartLine(req.getStartLine());
        comment.setEndLine(req.getEndLine());
        comment.setBody(req.getBody());
        FeedbackComment saved = feedbackCommentRepository.save(comment);
        return toFeedbackResponse(saved);
    }

    public void deleteFeedback(UserPrincipal principal, UUID feedbackId) {
        FeedbackComment comment = findFeedbackOrThrow(feedbackId);
        User user = findUserOrThrow(principal);
        Course course = comment.getSubmission().getAssignment().getCourse();
        CourseRole courseRole = getCourseRole(course, user);
        boolean isAuthor = comment.getAuthor().getId().equals(user.getId());
        boolean isTeacher = courseRole == CourseRole.TEACHER;
        if (!isAuthor && !isTeacher) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "フィードバックの削除権限がありません");
        }
        feedbackCommentRepository.delete(comment);
    }

    private CourseRole getCourseRole(Course course, User user) {
        if (course.getOwner().getId().equals(user.getId())) {
            return CourseRole.TEACHER;
        }
        return courseEnrollmentRepository.findByCourseAndUser(course, user)
                .map(CourseEnrollment::getRole)
                .orElse(null);
    }

    private Submission findSubmissionOrThrow(UUID id) {
        return submissionRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "提出が見つかりません"));
    }

    private FeedbackComment findFeedbackOrThrow(UUID id) {
        return feedbackCommentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "フィードバックが見つかりません"));
    }

    private User findUserOrThrow(UserPrincipal principal) {
        return userRepository.findByEmail(principal.getUsername())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "ユーザーが見つかりません"));
    }

    private FeedbackResponse toFeedbackResponse(FeedbackComment comment) {
        return new FeedbackResponse(
                comment.getId(),
                comment.getSubmission().getId(),
                comment.getAuthor().getId(),
                comment.getAuthor().getName(),
                comment.getStartLine(),
                comment.getEndLine(),
                comment.getBody(),
                comment.getCreatedAt()
        );
    }
}

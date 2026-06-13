package com.shootingstar.service;

import com.shootingstar.dto.grade.AssignmentGrade;
import com.shootingstar.dto.grade.CourseGradeResponse;
import com.shootingstar.dto.grade.StudentGradeResponse;
import com.shootingstar.entity.Assignment;
import com.shootingstar.entity.Course;
import com.shootingstar.entity.CourseEnrollment;
import com.shootingstar.entity.CourseRole;
import com.shootingstar.entity.Submission;
import com.shootingstar.entity.User;
import com.shootingstar.repository.AssignmentRepository;
import com.shootingstar.repository.CourseEnrollmentRepository;
import com.shootingstar.repository.CourseRepository;
import com.shootingstar.repository.SubmissionRepository;
import com.shootingstar.repository.TestCaseRepository;
import com.shootingstar.repository.UserRepository;
import com.shootingstar.security.UserPrincipal;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class GradeService {

    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final CourseEnrollmentRepository courseEnrollmentRepository;
    private final AssignmentRepository assignmentRepository;
    private final TestCaseRepository testCaseRepository;
    private final SubmissionRepository submissionRepository;

    public GradeService(UserRepository userRepository,
                        CourseRepository courseRepository,
                        CourseEnrollmentRepository courseEnrollmentRepository,
                        AssignmentRepository assignmentRepository,
                        TestCaseRepository testCaseRepository,
                        SubmissionRepository submissionRepository) {
        this.userRepository = userRepository;
        this.courseRepository = courseRepository;
        this.courseEnrollmentRepository = courseEnrollmentRepository;
        this.assignmentRepository = assignmentRepository;
        this.testCaseRepository = testCaseRepository;
        this.submissionRepository = submissionRepository;
    }

    public CourseGradeResponse getCourseGrades(UserPrincipal principal, UUID courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "授業が見つかりません"));
        User user = userRepository.findByEmail(principal.getUsername())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "ユーザーが見つかりません"));
        CourseRole courseRole = getCourseRole(course, user);
        if (courseRole == null) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "この授業へのアクセス権がありません");
        }

        List<Assignment> assignments = assignmentRepository.findByCourse(course);

        if (courseRole == CourseRole.STUDENT) {
            StudentGradeResponse studentGrade = computeStudentGrade(user, assignments);
            return new CourseGradeResponse(course.getId(), course.getName(), List.of(studentGrade));
        }

        List<CourseEnrollment> enrollments = courseEnrollmentRepository.findByCourse(course).stream()
                .filter(e -> e.getRole() == CourseRole.STUDENT)
                .collect(Collectors.toList());

        List<StudentGradeResponse> grades = new ArrayList<>();
        for (CourseEnrollment enrollment : enrollments) {
            grades.add(computeStudentGrade(enrollment.getUser(), assignments));
        }

        return new CourseGradeResponse(course.getId(), course.getName(), grades);
    }

    private StudentGradeResponse computeStudentGrade(User student, List<Assignment> assignments) {
        List<AssignmentGrade> assignmentGrades = new ArrayList<>();
        int totalScore = 0;
        int maxTotalScore = 0;

        for (Assignment assignment : assignments) {
            Optional<Submission> latestSubmissionOpt = submissionRepository
                    .findTopByAssignmentAndUserOrderBySubmittedAtDesc(assignment, student)
                    .filter(s -> s.getSubmittedAt().isBefore(assignment.getDeadlineAt())
                            || s.getSubmittedAt().isEqual(assignment.getDeadlineAt()));

            int score = latestSubmissionOpt.map(s -> s.getScore() != null ? s.getScore() : 0).orElse(0);
            int maxScore;
            if (assignment.getMaxScore() != null) {
                maxScore = assignment.getMaxScore();
            } else {
                maxScore = testCaseRepository.findByAssignmentOrderByOrderIndexAsc(assignment)
                        .stream()
                        .mapToInt(tc -> tc.getScore() != null ? tc.getScore() : 0)
                        .sum();
            }
            boolean submitted = latestSubmissionOpt.isPresent();
            boolean returned = latestSubmissionOpt.map(Submission::isReturned).orElse(false);

            assignmentGrades.add(new AssignmentGrade(
                    assignment.getId(),
                    assignment.getTitle(),
                    score,
                    maxScore,
                    submitted,
                    returned
            ));

            totalScore += score;
            maxTotalScore += maxScore;
        }

        return new StudentGradeResponse(
                student.getId(),
                student.getName(),
                student.getEmail(),
                assignmentGrades,
                totalScore,
                maxTotalScore
        );
    }

    private CourseRole getCourseRole(Course course, User user) {
        if (course.getOwner().getId().equals(user.getId())) {
            return CourseRole.TEACHER;
        }
        return courseEnrollmentRepository.findByCourseAndUser(course, user)
                .map(CourseEnrollment::getRole)
                .orElse(null);
    }
}

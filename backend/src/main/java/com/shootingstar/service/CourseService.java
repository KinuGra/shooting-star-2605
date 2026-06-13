package com.shootingstar.service;

import com.shootingstar.dto.course.*;
import com.shootingstar.entity.*;
import com.shootingstar.repository.CourseEnrollmentRepository;
import com.shootingstar.repository.CourseRepository;
import com.shootingstar.repository.UserRepository;
import com.shootingstar.security.UserPrincipal;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.security.SecureRandom;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class CourseService {

    private static final String INVITE_CODE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    private static final int INVITE_CODE_LENGTH = 6;
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final CourseEnrollmentRepository courseEnrollmentRepository;

    public CourseService(UserRepository userRepository,
                         CourseRepository courseRepository,
                         CourseEnrollmentRepository courseEnrollmentRepository) {
        this.userRepository = userRepository;
        this.courseRepository = courseRepository;
        this.courseEnrollmentRepository = courseEnrollmentRepository;
    }

    @Transactional
    public CourseResponse createCourse(UserPrincipal principal, CreateCourseRequest req) {
        if (principal.getGlobalRole() != GlobalRole.TEACHER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "TEACHERのみ授業を作成できます");
        }
        User user = findUserOrThrow(principal);
        String inviteCode = generateUniqueInviteCode();
        Course course = new Course();
        course.setOwner(user);
        course.setName(req.getName());
        course.setDescription(req.getDescription());
        course.setInviteCode(inviteCode);
        Course saved = courseRepository.save(course);
        return toCourseResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<CourseResponse> getMyCourses(UserPrincipal principal) {
        User user = findUserOrThrow(principal);
        GlobalRole role = principal.getGlobalRole();
        if (role == GlobalRole.ADMIN) {
            return courseRepository.findAll().stream()
                    .map(this::toCourseResponse)
                    .collect(Collectors.toList());
        }
        if (role == GlobalRole.TEACHER) {
            return courseRepository.findByOwner(user).stream()
                    .map(this::toCourseResponse)
                    .collect(Collectors.toList());
        }
        return courseEnrollmentRepository.findByUser(user).stream()
                .map(e -> toCourseResponse(e.getCourse()))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CourseResponse getCourse(UserPrincipal principal, UUID courseId) {
        Course course = findCourseOrThrow(courseId);
        User user = findUserOrThrow(principal);
        boolean isOwner = course.getOwner().getId().equals(principal.getId());
        boolean isEnrolled = courseEnrollmentRepository.existsByCourseAndUser(course, user);
        if (!isOwner && !isEnrolled && principal.getGlobalRole() != GlobalRole.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "この授業へのアクセス権がありません");
        }
        return toCourseResponse(course);
    }

    @Transactional
    public CourseResponse updateCourse(UserPrincipal principal, UUID courseId, UpdateCourseRequest req) {
        Course course = findCourseOrThrow(courseId);
        if (!course.getOwner().getId().equals(principal.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "授業のオーナーのみ更新できます");
        }
        course.setName(req.getName());
        course.setDescription(req.getDescription());
        Course saved = courseRepository.save(course);
        return toCourseResponse(saved);
    }

    @Transactional
    public CourseResponse regenerateInviteCode(UserPrincipal principal, UUID courseId) {
        Course course = findCourseOrThrow(courseId);
        if (!course.getOwner().getId().equals(principal.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "授業のオーナーのみ招待コードを再発行できます");
        }
        course.setInviteCode(generateUniqueInviteCode());
        Course saved = courseRepository.save(course);
        return toCourseResponse(saved);
    }

    @Transactional
    public EnrollmentResponse joinCourse(UserPrincipal principal, JoinCourseRequest req) {
        if (principal.getGlobalRole() != GlobalRole.STUDENT) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "STUDENTのみ招待コードで授業に参加できます");
        }
        Course course = courseRepository.findByInviteCode(req.getInviteCode())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "招待コードが無効です"));
        User user = findUserOrThrow(principal);
        if (courseEnrollmentRepository.existsByCourseAndUser(course, user)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "すでにこの授業に参加しています");
        }
        CourseEnrollment enrollment = new CourseEnrollment();
        enrollment.setCourse(course);
        enrollment.setUser(user);
        enrollment.setRole(CourseRole.STUDENT);
        enrollment.setEnrolledAt(OffsetDateTime.now());
        CourseEnrollment saved = courseEnrollmentRepository.save(enrollment);
        return toEnrollmentResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<EnrollmentResponse> getEnrollments(UserPrincipal principal, UUID courseId) {
        Course course = findCourseOrThrow(courseId);
        User user = findUserOrThrow(principal);
        CourseRole courseRole = getCourseRole(course, user);
        if (courseRole != CourseRole.TEACHER && courseRole != CourseRole.TA) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "TEACHER/TAのみ受講生一覧を取得できます");
        }
        return courseEnrollmentRepository.findByCourse(course).stream()
                .map(this::toEnrollmentResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public EnrollmentResponse updateEnrollmentRole(UserPrincipal principal, UUID courseId,
                                                   UUID userId, UpdateEnrollmentRoleRequest req) {
        Course course = findCourseOrThrow(courseId);
        if (!course.getOwner().getId().equals(principal.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "授業のオーナーのみロールを変更できます");
        }
        if (req.getRole() == CourseRole.TEACHER) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "TEACHERへのロール変更はできません");
        }
        User targetUser = findUserByIdOrThrow(userId);
        CourseEnrollment enrollment = courseEnrollmentRepository.findByCourseAndUser(course, targetUser)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "対象ユーザーはこの授業に参加していません"));
        enrollment.setRole(req.getRole());
        CourseEnrollment saved = courseEnrollmentRepository.save(enrollment);
        return toEnrollmentResponse(saved);
    }

    @Transactional
    public void removeEnrollment(UserPrincipal principal, UUID courseId, UUID userId) {
        Course course = findCourseOrThrow(courseId);
        if (!course.getOwner().getId().equals(principal.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "授業のオーナーのみ受講生を削除できます");
        }
        User targetUser = findUserByIdOrThrow(userId);
        CourseEnrollment enrollment = courseEnrollmentRepository.findByCourseAndUser(course, targetUser)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "対象ユーザーはこの授業に参加していません"));
        courseEnrollmentRepository.delete(enrollment);
    }

    private CourseRole getCourseRole(Course course, User user) {
        if (course.getOwner().getId().equals(user.getId())) {
            return CourseRole.TEACHER;
        }
        return courseEnrollmentRepository.findByCourseAndUser(course, user)
                .map(CourseEnrollment::getRole)
                .orElse(null);
    }

    private Course findCourseOrThrow(UUID id) {
        return courseRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "授業が見つかりません"));
    }

    private User findUserOrThrow(UserPrincipal principal) {
        return userRepository.findByEmail(principal.getUsername())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "ユーザーが見つかりません"));
    }

    private User findUserByIdOrThrow(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "ユーザーが見つかりません"));
    }

    private String generateInviteCode() {
        StringBuilder sb = new StringBuilder(INVITE_CODE_LENGTH);
        for (int i = 0; i < INVITE_CODE_LENGTH; i++) {
            sb.append(INVITE_CODE_CHARS.charAt(SECURE_RANDOM.nextInt(INVITE_CODE_CHARS.length())));
        }
        return sb.toString();
    }

    private String generateUniqueInviteCode() {
        String code;
        do {
            code = generateInviteCode();
        } while (courseRepository.findByInviteCode(code).isPresent());
        return code;
    }

    private CourseResponse toCourseResponse(Course course) {
        return new CourseResponse(
                course.getId(),
                course.getName(),
                course.getDescription(),
                course.getInviteCode(),
                course.getOwner().getId(),
                course.getOwner().getName(),
                course.getCreatedAt(),
                course.getUpdatedAt()
        );
    }

    private EnrollmentResponse toEnrollmentResponse(CourseEnrollment enrollment) {
        User user = enrollment.getUser();
        return new EnrollmentResponse(
                enrollment.getId(),
                user.getId(),
                user.getName(),
                user.getEmail(),
                enrollment.getRole().name(),
                enrollment.getEnrolledAt()
        );
    }
}

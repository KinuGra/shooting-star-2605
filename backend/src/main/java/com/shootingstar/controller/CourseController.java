package com.shootingstar.controller;

import com.shootingstar.dto.course.*;
import com.shootingstar.security.UserPrincipal;
import com.shootingstar.service.CourseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/courses")
@Tag(name = "Courses", description = "授業管理")
public class CourseController {

    private final CourseService courseService;

    public CourseController(CourseService courseService) {
        this.courseService = courseService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "授業作成")
    public CourseResponse createCourse(@AuthenticationPrincipal UserPrincipal principal,
                                       @Valid @RequestBody CreateCourseRequest req) {
        return courseService.createCourse(principal, req);
    }

    @GetMapping
    @Operation(summary = "授業一覧取得")
    public List<CourseResponse> getMyCourses(@AuthenticationPrincipal UserPrincipal principal) {
        return courseService.getMyCourses(principal);
    }

    @GetMapping("/{id}")
    @Operation(summary = "授業詳細取得")
    public CourseResponse getCourse(@AuthenticationPrincipal UserPrincipal principal,
                                    @PathVariable UUID id) {
        return courseService.getCourse(principal, id);
    }

    @PutMapping("/{id}")
    @Operation(summary = "授業更新")
    public CourseResponse updateCourse(@AuthenticationPrincipal UserPrincipal principal,
                                       @PathVariable UUID id,
                                       @Valid @RequestBody UpdateCourseRequest req) {
        return courseService.updateCourse(principal, id, req);
    }

    @PostMapping("/{id}/invite-code/regenerate")
    @Operation(summary = "招待コード再発行")
    public CourseResponse regenerateInviteCode(@AuthenticationPrincipal UserPrincipal principal,
                                               @PathVariable UUID id) {
        return courseService.regenerateInviteCode(principal, id);
    }

    @PostMapping("/join")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "授業参加（招待コード）")
    public EnrollmentResponse joinCourse(@AuthenticationPrincipal UserPrincipal principal,
                                         @Valid @RequestBody JoinCourseRequest req) {
        return courseService.joinCourse(principal, req);
    }

    @GetMapping("/{id}/enrollments")
    @Operation(summary = "受講生一覧取得")
    public List<EnrollmentResponse> getEnrollments(@AuthenticationPrincipal UserPrincipal principal,
                                                   @PathVariable UUID id) {
        return courseService.getEnrollments(principal, id);
    }

    @PutMapping("/{id}/enrollments/{userId}/role")
    @Operation(summary = "受講生ロール変更")
    public EnrollmentResponse updateEnrollmentRole(@AuthenticationPrincipal UserPrincipal principal,
                                                   @PathVariable UUID id,
                                                   @PathVariable UUID userId,
                                                   @Valid @RequestBody UpdateEnrollmentRoleRequest req) {
        return courseService.updateEnrollmentRole(principal, id, userId, req);
    }

    @DeleteMapping("/{id}/enrollments/{userId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "受講生削除")
    public void removeEnrollment(@AuthenticationPrincipal UserPrincipal principal,
                                 @PathVariable UUID id,
                                 @PathVariable UUID userId) {
        courseService.removeEnrollment(principal, id, userId);
    }
}

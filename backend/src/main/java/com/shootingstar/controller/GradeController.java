package com.shootingstar.controller;

import com.shootingstar.dto.grade.CourseGradeResponse;
import com.shootingstar.security.UserPrincipal;
import com.shootingstar.service.GradeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@Tag(name = "Grades", description = "成績管理")
public class GradeController {

    private final GradeService gradeService;

    public GradeController(GradeService gradeService) {
        this.gradeService = gradeService;
    }

    @GetMapping("/courses/{courseId}/grades")
    @Operation(summary = "授業成績一覧取得")
    public CourseGradeResponse getCourseGrades(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID courseId) {
        return gradeService.getCourseGrades(principal, courseId);
    }
}

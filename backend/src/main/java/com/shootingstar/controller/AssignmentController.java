package com.shootingstar.controller;

import com.shootingstar.dto.assignment.*;
import com.shootingstar.security.UserPrincipal;
import com.shootingstar.service.AssignmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@Tag(name = "Assignments", description = "課題管理")
public class AssignmentController {

    private final AssignmentService assignmentService;

    public AssignmentController(AssignmentService assignmentService) {
        this.assignmentService = assignmentService;
    }

    @PostMapping("/courses/{courseId}/assignments")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "課題を作成する")
    public AssignmentResponse createAssignment(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID courseId,
            @Valid @RequestBody CreateAssignmentRequest req) {
        return assignmentService.createAssignment(principal, courseId, req);
    }

    @GetMapping("/courses/{courseId}/assignments")
    @Operation(summary = "コースの課題一覧を取得する")
    public List<AssignmentResponse> getAssignments(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID courseId) {
        return assignmentService.getAssignments(principal, courseId);
    }

    @GetMapping("/assignments/{id}")
    @Operation(summary = "課題を取得する")
    public AssignmentResponse getAssignment(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID id) {
        return assignmentService.getAssignment(principal, id);
    }

    @PutMapping("/assignments/{id}")
    @Operation(summary = "課題を更新する")
    public AssignmentResponse updateAssignment(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID id,
            @RequestBody UpdateAssignmentRequest req) {
        return assignmentService.updateAssignment(principal, id, req);
    }

    @PutMapping("/assignments/{id}/publish")
    @Operation(summary = "課題の公開状態を変更する")
    public AssignmentResponse publishAssignment(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID id,
            @Valid @RequestBody PublishAssignmentRequest req) {
        return assignmentService.publishAssignment(principal, id, req);
    }

    @PostMapping("/assignments/{id}/test-cases")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "テストケースを作成する")
    public TestCaseResponse createTestCase(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID id,
            @Valid @RequestBody CreateTestCaseRequest req) {
        return assignmentService.createTestCase(principal, id, req);
    }

    @GetMapping("/assignments/{id}/test-cases")
    @Operation(summary = "テストケース一覧を取得する")
    public List<TestCaseResponse> getTestCases(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID id) {
        return assignmentService.getTestCases(principal, id);
    }

    @PutMapping("/test-cases/{id}")
    @Operation(summary = "テストケースを更新する")
    public TestCaseResponse updateTestCase(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID id,
            @RequestBody UpdateTestCaseRequest req) {
        return assignmentService.updateTestCase(principal, id, req);
    }

    @DeleteMapping("/test-cases/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "テストケースを削除する")
    public void deleteTestCase(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID id) {
        assignmentService.deleteTestCase(principal, id);
    }
}

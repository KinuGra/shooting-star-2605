package com.shootingstar.controller;

import com.shootingstar.dto.submission.SubmissionResponse;
import com.shootingstar.dto.submission.SubmitRequest;
import com.shootingstar.dto.submission.UpdateScoreRequest;
import com.shootingstar.security.UserPrincipal;
import com.shootingstar.service.SubmissionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@Tag(name = "Submissions", description = "提出管理")
public class SubmissionController {

    private final SubmissionService submissionService;

    public SubmissionController(SubmissionService submissionService) {
        this.submissionService = submissionService;
    }

    @PostMapping("/assignments/{assignmentId}/submissions")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "課題提出")
    public SubmissionResponse submit(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID assignmentId,
            @RequestBody SubmitRequest req) {
        return submissionService.submit(principal, assignmentId, req);
    }

    @GetMapping("/assignments/{assignmentId}/submissions")
    @Operation(summary = "提出一覧取得")
    public List<SubmissionResponse> getSubmissions(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID assignmentId) {
        return submissionService.getSubmissions(principal, assignmentId);
    }

    @GetMapping("/submissions/{id}")
    @Operation(summary = "提出詳細取得")
    public SubmissionResponse getSubmission(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID id) {
        return submissionService.getSubmission(principal, id);
    }

    @PostMapping("/assignments/{assignmentId}/return")
    @Operation(summary = "提出物を返却")
    public List<SubmissionResponse> returnSubmissions(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID assignmentId) {
        return submissionService.returnSubmissions(principal, assignmentId);
    }

    @PutMapping("/submissions/{id}/score")
    @Operation(summary = "スコア更新")
    public SubmissionResponse updateScore(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID id,
            @RequestBody @Valid UpdateScoreRequest req) {
        return submissionService.updateScore(principal, id, req);
    }

}

package com.shootingstar.controller;

import com.shootingstar.dto.feedback.CreateFeedbackRequest;
import com.shootingstar.dto.feedback.FeedbackResponse;
import com.shootingstar.dto.feedback.UpdateFeedbackRequest;
import com.shootingstar.security.UserPrincipal;
import com.shootingstar.service.FeedbackService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@Tag(name = "Feedback", description = "フィードバックコメント")
public class FeedbackController {

    private final FeedbackService feedbackService;

    public FeedbackController(FeedbackService feedbackService) {
        this.feedbackService = feedbackService;
    }

    @PostMapping("/submissions/{submissionId}/feedback")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "フィードバック追加")
    public FeedbackResponse addFeedback(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID submissionId,
            @RequestBody @Valid CreateFeedbackRequest req) {
        return feedbackService.addFeedback(principal, submissionId, req);
    }

    @GetMapping("/submissions/{submissionId}/feedback")
    @Operation(summary = "フィードバック一覧取得")
    public List<FeedbackResponse> getFeedback(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID submissionId) {
        return feedbackService.getFeedback(principal, submissionId);
    }

    @PutMapping("/feedback/{id}")
    @Operation(summary = "フィードバック更新")
    public FeedbackResponse updateFeedback(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID id,
            @RequestBody @Valid UpdateFeedbackRequest req) {
        return feedbackService.updateFeedback(principal, id, req);
    }

    @DeleteMapping("/feedback/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "フィードバック削除")
    public void deleteFeedback(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID id) {
        feedbackService.deleteFeedback(principal, id);
    }
}

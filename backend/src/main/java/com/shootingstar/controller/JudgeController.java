package com.shootingstar.controller;

import com.shootingstar.dto.judge.JudgeResultResponse;
import com.shootingstar.security.UserPrincipal;
import com.shootingstar.service.JudgeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@Tag(name = "Judge", description = "採点結果")
public class JudgeController {

    private final JudgeService judgeService;

    public JudgeController(JudgeService judgeService) {
        this.judgeService = judgeService;
    }

    @GetMapping("/submissions/{submissionId}/judge-results")
    @Operation(summary = "採点結果取得")
    public List<JudgeResultResponse> getJudgeResults(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID submissionId) {
        return judgeService.getJudgeResults(principal, submissionId);
    }
}

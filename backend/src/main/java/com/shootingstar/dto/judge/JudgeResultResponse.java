package com.shootingstar.dto.judge;

import java.time.OffsetDateTime;
import java.util.UUID;

public class JudgeResultResponse {

    private UUID id;
    private UUID submissionId;
    private UUID testCaseId;
    private String status;
    private Integer executionTimeMs;
    private Integer memoryKb;
    private OffsetDateTime createdAt;

    public JudgeResultResponse() {}

    public JudgeResultResponse(UUID id, UUID submissionId, UUID testCaseId, String status,
                                Integer executionTimeMs, Integer memoryKb, OffsetDateTime createdAt) {
        this.id = id;
        this.submissionId = submissionId;
        this.testCaseId = testCaseId;
        this.status = status;
        this.executionTimeMs = executionTimeMs;
        this.memoryKb = memoryKb;
        this.createdAt = createdAt;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getSubmissionId() { return submissionId; }
    public void setSubmissionId(UUID submissionId) { this.submissionId = submissionId; }

    public UUID getTestCaseId() { return testCaseId; }
    public void setTestCaseId(UUID testCaseId) { this.testCaseId = testCaseId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Integer getExecutionTimeMs() { return executionTimeMs; }
    public void setExecutionTimeMs(Integer executionTimeMs) { this.executionTimeMs = executionTimeMs; }

    public Integer getMemoryKb() { return memoryKb; }
    public void setMemoryKb(Integer memoryKb) { this.memoryKb = memoryKb; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
}

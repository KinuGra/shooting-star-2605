package com.shootingstar.dto.feedback;

import java.time.OffsetDateTime;
import java.util.UUID;

public class FeedbackResponse {

    private UUID id;
    private UUID submissionId;
    private UUID authorId;
    private String authorName;
    private Integer startLine;
    private Integer endLine;
    private String body;
    private OffsetDateTime createdAt;

    public FeedbackResponse(UUID id, UUID submissionId, UUID authorId, String authorName,
                            Integer startLine, Integer endLine, String body, OffsetDateTime createdAt) {
        this.id = id;
        this.submissionId = submissionId;
        this.authorId = authorId;
        this.authorName = authorName;
        this.startLine = startLine;
        this.endLine = endLine;
        this.body = body;
        this.createdAt = createdAt;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getSubmissionId() { return submissionId; }
    public void setSubmissionId(UUID submissionId) { this.submissionId = submissionId; }

    public UUID getAuthorId() { return authorId; }
    public void setAuthorId(UUID authorId) { this.authorId = authorId; }

    public String getAuthorName() { return authorName; }
    public void setAuthorName(String authorName) { this.authorName = authorName; }

    public Integer getStartLine() { return startLine; }
    public void setStartLine(Integer startLine) { this.startLine = startLine; }

    public Integer getEndLine() { return endLine; }
    public void setEndLine(Integer endLine) { this.endLine = endLine; }

    public String getBody() { return body; }
    public void setBody(String body) { this.body = body; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
}

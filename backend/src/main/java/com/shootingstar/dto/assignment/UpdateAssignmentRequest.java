package com.shootingstar.dto.assignment;

import com.shootingstar.entity.SubmissionType;

import java.time.OffsetDateTime;
import java.util.List;

public class UpdateAssignmentRequest {

    private String title;

    private String description;

    private SubmissionType submissionType;

    private Boolean isPublished;

    private OffsetDateTime publishAt;

    private OffsetDateTime deadlineAt;

    private Integer maxScore;

    private List<String> languages;

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public SubmissionType getSubmissionType() { return submissionType; }
    public void setSubmissionType(SubmissionType submissionType) { this.submissionType = submissionType; }

    public Boolean getIsPublished() { return isPublished; }
    public void setIsPublished(Boolean isPublished) { this.isPublished = isPublished; }

    public OffsetDateTime getPublishAt() { return publishAt; }
    public void setPublishAt(OffsetDateTime publishAt) { this.publishAt = publishAt; }

    public OffsetDateTime getDeadlineAt() { return deadlineAt; }
    public void setDeadlineAt(OffsetDateTime deadlineAt) { this.deadlineAt = deadlineAt; }

    public Integer getMaxScore() { return maxScore; }
    public void setMaxScore(Integer maxScore) { this.maxScore = maxScore; }

    public List<String> getLanguages() { return languages; }
    public void setLanguages(List<String> languages) { this.languages = languages; }
}

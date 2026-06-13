package com.shootingstar.dto.assignment;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public class AssignmentResponse {

    private UUID id;
    private UUID courseId;
    private String courseTitle;
    private String title;
    private String description;
    private String submissionType;
    private boolean isPublished;
    private OffsetDateTime publishAt;
    private OffsetDateTime deadlineAt;
    private Integer maxScore;
    private List<String> languages;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getCourseId() { return courseId; }
    public void setCourseId(UUID courseId) { this.courseId = courseId; }

    public String getCourseTitle() { return courseTitle; }
    public void setCourseTitle(String courseTitle) { this.courseTitle = courseTitle; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getSubmissionType() { return submissionType; }
    public void setSubmissionType(String submissionType) { this.submissionType = submissionType; }

    public boolean getIsPublished() { return isPublished; }
    public void setIsPublished(boolean isPublished) { this.isPublished = isPublished; }

    public OffsetDateTime getPublishAt() { return publishAt; }
    public void setPublishAt(OffsetDateTime publishAt) { this.publishAt = publishAt; }

    public OffsetDateTime getDeadlineAt() { return deadlineAt; }
    public void setDeadlineAt(OffsetDateTime deadlineAt) { this.deadlineAt = deadlineAt; }

    public Integer getMaxScore() { return maxScore; }
    public void setMaxScore(Integer maxScore) { this.maxScore = maxScore; }

    public List<String> getLanguages() { return languages; }
    public void setLanguages(List<String> languages) { this.languages = languages; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }

    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }
}

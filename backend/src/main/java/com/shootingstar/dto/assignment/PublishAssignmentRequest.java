package com.shootingstar.dto.assignment;

import jakarta.validation.constraints.NotNull;

import java.time.OffsetDateTime;

public class PublishAssignmentRequest {

    @NotNull
    private Boolean isPublished;

    private OffsetDateTime publishAt;

    public Boolean getIsPublished() { return isPublished; }
    public void setIsPublished(Boolean isPublished) { this.isPublished = isPublished; }

    public OffsetDateTime getPublishAt() { return publishAt; }
    public void setPublishAt(OffsetDateTime publishAt) { this.publishAt = publishAt; }
}

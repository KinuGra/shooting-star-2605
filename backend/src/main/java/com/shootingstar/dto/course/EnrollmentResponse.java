package com.shootingstar.dto.course;

import java.time.OffsetDateTime;
import java.util.UUID;

public class EnrollmentResponse {

    private UUID id;
    private UUID userId;
    private String userName;
    private String userEmail;
    private String role;
    private OffsetDateTime enrolledAt;

    public EnrollmentResponse() {}

    public EnrollmentResponse(UUID id, UUID userId, String userName, String userEmail,
                              String role, OffsetDateTime enrolledAt) {
        this.id = id;
        this.userId = userId;
        this.userName = userName;
        this.userEmail = userEmail;
        this.role = role;
        this.enrolledAt = enrolledAt;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public OffsetDateTime getEnrolledAt() { return enrolledAt; }
    public void setEnrolledAt(OffsetDateTime enrolledAt) { this.enrolledAt = enrolledAt; }
}

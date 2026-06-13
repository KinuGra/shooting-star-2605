package com.shootingstar.dto.auth;

import java.time.OffsetDateTime;
import java.util.UUID;

public class MeResponse {

    private UUID id;
    private String email;
    private String name;
    private String role;
    private boolean totpEnabled;
    private OffsetDateTime createdAt;

    public MeResponse(UUID id, String email, String name, String role, boolean totpEnabled, OffsetDateTime createdAt) {
        this.id = id;
        this.email = email;
        this.name = name;
        this.role = role;
        this.totpEnabled = totpEnabled;
        this.createdAt = createdAt;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public boolean isTotpEnabled() { return totpEnabled; }
    public void setTotpEnabled(boolean totpEnabled) { this.totpEnabled = totpEnabled; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
}

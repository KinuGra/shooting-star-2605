package com.shootingstar.dto.course;

import jakarta.validation.constraints.NotBlank;

public class JoinCourseRequest {

    @NotBlank
    private String inviteCode;

    public String getInviteCode() { return inviteCode; }
    public void setInviteCode(String inviteCode) { this.inviteCode = inviteCode; }
}

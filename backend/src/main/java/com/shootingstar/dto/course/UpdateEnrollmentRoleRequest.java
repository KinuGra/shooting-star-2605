package com.shootingstar.dto.course;

import com.shootingstar.entity.CourseRole;
import jakarta.validation.constraints.NotNull;

public class UpdateEnrollmentRoleRequest {

    @NotNull
    private CourseRole role;

    public CourseRole getRole() { return role; }
    public void setRole(CourseRole role) { this.role = role; }
}

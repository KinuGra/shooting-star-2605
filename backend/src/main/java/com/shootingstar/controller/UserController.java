package com.shootingstar.controller;

import com.shootingstar.dto.user.CreateTeacherRequest;
import com.shootingstar.dto.user.UserResponse;
import com.shootingstar.security.UserPrincipal;
import com.shootingstar.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/users")
@Tag(name = "Users", description = "ユーザー管理（ADMIN用）")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/teachers")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "教師アカウント作成")
    public UserResponse createTeacher(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody @Valid CreateTeacherRequest req) {
        return userService.createTeacher(principal, req);
    }

    @GetMapping
    @Operation(summary = "ユーザー一覧取得")
    public List<UserResponse> getAllUsers(
            @AuthenticationPrincipal UserPrincipal principal) {
        return userService.getAllUsers(principal);
    }

    @GetMapping("/{id}")
    @Operation(summary = "ユーザー詳細取得")
    public UserResponse getUserById(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID id) {
        return userService.getUserById(principal, id);
    }
}

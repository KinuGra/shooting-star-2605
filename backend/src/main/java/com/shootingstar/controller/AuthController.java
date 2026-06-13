package com.shootingstar.controller;

import com.shootingstar.dto.auth.*;
import com.shootingstar.security.UserPrincipal;
import com.shootingstar.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@Tag(name = "Auth", description = "認証・認可")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "学生登録")
    public AuthResponse register(@RequestBody @Valid RegisterRequest req) {
        return authService.register(req);
    }

    @PostMapping("/login")
    @Operation(summary = "ログイン")
    public ResponseEntity<Object> login(@RequestBody @Valid LoginRequest req) {
        return ResponseEntity.ok(authService.login(req));
    }

    @PostMapping("/login/totp")
    @Operation(summary = "TOTPログイン")
    public AuthResponse loginWithTotp(@RequestBody @Valid TotpLoginRequest req) {
        return authService.loginWithTotp(req);
    }

    @PostMapping("/logout")
    @Operation(summary = "ログアウト")
    public Map<String, String> logout() {
        return Map.of("message", "ログアウトしました");
    }

    @GetMapping("/me")
    @Operation(summary = "現在のユーザー情報取得")
    public MeResponse me(@AuthenticationPrincipal UserPrincipal principal) {
        return authService.getMe(principal);
    }

    @PostMapping("/2fa/setup")
    @Operation(summary = "TOTP設定開始")
    public SetupTotpResponse setupTotp(@AuthenticationPrincipal UserPrincipal principal) {
        return authService.setupTotp(principal);
    }

    @PostMapping("/2fa/enable")
    @Operation(summary = "TOTP有効化")
    public EnableTotpResponse enableTotp(@AuthenticationPrincipal UserPrincipal principal,
                                         @RequestBody @Valid EnableTotpRequest req) {
        return authService.enableTotp(principal, req);
    }

    @PostMapping("/2fa/disable")
    @Operation(summary = "TOTP無効化")
    public ResponseEntity<Void> disableTotp(@AuthenticationPrincipal UserPrincipal principal,
                                             @RequestBody @Valid DisableTotpRequest req) {
        authService.disableTotp(principal, req);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/2fa/backup-codes/regenerate")
    @Operation(summary = "バックアップコード再生成")
    public List<String> regenerateBackupCodes(@AuthenticationPrincipal UserPrincipal principal) {
        return authService.regenerateBackupCodes(principal);
    }
}

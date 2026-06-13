package com.shootingstar.service;

import com.shootingstar.dto.auth.*;
import com.shootingstar.entity.User;
import com.shootingstar.entity.GlobalRole;
import com.shootingstar.entity.UserTotpBackupCode;
import com.shootingstar.entity.UserTotpSecret;
import com.shootingstar.repository.UserRepository;
import com.shootingstar.repository.UserTotpBackupCodeRepository;
import com.shootingstar.repository.UserTotpSecretRepository;
import com.shootingstar.security.JwtUtil;
import com.shootingstar.security.UserPrincipal;
import dev.samstevens.totp.code.DefaultCodeGenerator;
import dev.samstevens.totp.code.DefaultCodeVerifier;
import dev.samstevens.totp.secret.DefaultSecretGenerator;
import dev.samstevens.totp.time.SystemTimeProvider;
import io.jsonwebtoken.Claims;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.security.SecureRandom;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final UserTotpSecretRepository userTotpSecretRepository;
    private final UserTotpBackupCodeRepository userTotpBackupCodeRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository,
                       UserTotpSecretRepository userTotpSecretRepository,
                       UserTotpBackupCodeRepository userTotpBackupCodeRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.userTotpSecretRepository = userTotpSecretRepository;
        this.userTotpBackupCodeRepository = userTotpBackupCodeRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "このメールアドレスはすでに登録されています");
        }
        User user = new User();
        user.setEmail(req.getEmail());
        user.setName(req.getName());
        user.setPasswordHash(passwordEncoder.encode(req.getPassword()));
        user.setGlobalRole(GlobalRole.STUDENT);
        user.setEmailVerified(true);
        user = userRepository.save(user);
        UserPrincipal principal = new UserPrincipal(user);
        String token = jwtUtil.generateToken(principal);
        return new AuthResponse(token, user.getEmail(), user.getName(), GlobalRole.STUDENT.name());
    }

    @Transactional(readOnly = true)
    public Object login(LoginRequest req) {
        User user = userRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "メールアドレスまたはパスワードが正しくありません"));
        if (!user.isEmailVerified()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "メールアドレスが確認されていません");
        }
        if (!passwordEncoder.matches(req.getPassword(), user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "メールアドレスまたはパスワードが正しくありません");
        }
        if (user.isTotpEnabled()) {
            String tempToken = jwtUtil.generateTempToken(user.getId(), user.getEmail());
            return new MfaRequiredResponse(tempToken);
        }
        UserPrincipal principal = new UserPrincipal(user);
        String token = jwtUtil.generateToken(principal);
        return new AuthResponse(token, user.getEmail(), user.getName(), user.getGlobalRole().name());
    }

    @Transactional
    public AuthResponse loginWithTotp(TotpLoginRequest req) {
        if (!jwtUtil.isTokenValid(req.getTempToken()) || !jwtUtil.isMfaPendingToken(req.getTempToken())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "無効なトークンです");
        }
        Claims claims = jwtUtil.extractClaims(req.getTempToken());
        String email = claims.getSubject();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "ユーザーが見つかりません"));
        UserTotpSecret totpSecret = userTotpSecretRepository.findByUser(user)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "TOTP設定が見つかりません"));

        boolean verified = false;
        DefaultCodeVerifier verifier = new DefaultCodeVerifier(new DefaultCodeGenerator(), new SystemTimeProvider());
        if (verifier.isValidCode(totpSecret.getSecret(), req.getTotpCode())) {
            verified = true;
        }

        if (!verified) {
            List<UserTotpBackupCode> backupCodes = userTotpBackupCodeRepository.findByUserAndUsedFalse(user);
            for (UserTotpBackupCode code : backupCodes) {
                if (passwordEncoder.matches(req.getTotpCode(), code.getCodeHash())) {
                    code.setUsed(true);
                    code.setUsedAt(OffsetDateTime.now());
                    userTotpBackupCodeRepository.save(code);
                    verified = true;
                    break;
                }
            }
        }

        if (!verified) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "TOTPコードが正しくありません");
        }

        UserPrincipal principal = new UserPrincipal(user);
        String token = jwtUtil.generateToken(principal);
        return new AuthResponse(token, user.getEmail(), user.getName(), user.getGlobalRole().name());
    }

    @Transactional
    public SetupTotpResponse setupTotp(UserPrincipal principal) {
        User user = userRepository.findByEmail(principal.getEmail())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "ユーザーが見つかりません"));
        userTotpSecretRepository.findByUser(user).ifPresent(existing -> {
            userTotpSecretRepository.deleteByUser(user);
        });
        String secret = new DefaultSecretGenerator().generate();
        UserTotpSecret totpSecret = new UserTotpSecret();
        totpSecret.setUser(user);
        totpSecret.setSecret(secret);
        totpSecret.setCreatedAt(OffsetDateTime.now());
        userTotpSecretRepository.save(totpSecret);
        String qrUri = "otpauth://totp/ShootingStar:" + user.getEmail() + "?secret=" + secret + "&issuer=ShootingStar";
        return new SetupTotpResponse(secret, qrUri);
    }

    @Transactional
    public EnableTotpResponse enableTotp(UserPrincipal principal, EnableTotpRequest req) {
        User user = userRepository.findByEmail(principal.getEmail())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "ユーザーが見つかりません"));
        UserTotpSecret totpSecret = userTotpSecretRepository.findByUser(user)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "TOTP設定が見つかりません。まずセットアップを行ってください"));
        DefaultCodeVerifier verifier = new DefaultCodeVerifier(new DefaultCodeGenerator(), new SystemTimeProvider());
        if (!verifier.isValidCode(totpSecret.getSecret(), req.getTotpCode())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "TOTPコードが正しくありません");
        }
        user.setTotpEnabled(true);
        userRepository.save(user);
        userTotpBackupCodeRepository.deleteByUser(user);
        List<String> plainCodes = new ArrayList<>();
        for (int i = 0; i < 8; i++) {
            String code = generateBackupCode();
            plainCodes.add(code);
            UserTotpBackupCode backupCode = new UserTotpBackupCode();
            backupCode.setUser(user);
            backupCode.setCodeHash(passwordEncoder.encode(code));
            backupCode.setCreatedAt(OffsetDateTime.now());
            userTotpBackupCodeRepository.save(backupCode);
        }
        return new EnableTotpResponse(plainCodes);
    }

    @Transactional
    public void disableTotp(UserPrincipal principal, DisableTotpRequest req) {
        User user = userRepository.findByEmail(principal.getEmail())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "ユーザーが見つかりません"));
        if (!user.isTotpEnabled()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "TOTPは有効になっていません");
        }
        UserTotpSecret totpSecret = userTotpSecretRepository.findByUser(user)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "TOTP設定が見つかりません"));
        DefaultCodeVerifier verifier = new DefaultCodeVerifier(new DefaultCodeGenerator(), new SystemTimeProvider());
        if (!verifier.isValidCode(totpSecret.getSecret(), req.getTotpCode())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "TOTPコードが正しくありません");
        }
        userTotpSecretRepository.deleteByUser(user);
        userTotpBackupCodeRepository.deleteByUser(user);
        user.setTotpEnabled(false);
        userRepository.save(user);
    }

    @Transactional
    public List<String> regenerateBackupCodes(UserPrincipal principal) {
        User user = userRepository.findByEmail(principal.getEmail())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "ユーザーが見つかりません"));
        if (!user.isTotpEnabled()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "TOTPが有効になっていません");
        }
        userTotpSecretRepository.findByUser(user)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "TOTP設定が見つかりません"));
        userTotpBackupCodeRepository.deleteByUser(user);
        List<String> plainCodes = new ArrayList<>();
        for (int i = 0; i < 8; i++) {
            String code = generateBackupCode();
            plainCodes.add(code);
            UserTotpBackupCode backupCode = new UserTotpBackupCode();
            backupCode.setUser(user);
            backupCode.setCodeHash(passwordEncoder.encode(code));
            backupCode.setCreatedAt(OffsetDateTime.now());
            userTotpBackupCodeRepository.save(backupCode);
        }
        return plainCodes;
    }

    @Transactional(readOnly = true)
    public MeResponse getMe(UserPrincipal principal) {
        User user = userRepository.findByEmail(principal.getEmail())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "ユーザーが見つかりません"));
        return new MeResponse(
                user.getId(),
                user.getEmail(),
                user.getName(),
                user.getGlobalRole().name(),
                user.isTotpEnabled(),
                user.getCreatedAt()
        );
    }

    private String generateBackupCode() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        SecureRandom random = new SecureRandom();
        StringBuilder sb = new StringBuilder(8);
        for (int i = 0; i < 8; i++) sb.append(chars.charAt(random.nextInt(chars.length())));
        return sb.toString();
    }
}

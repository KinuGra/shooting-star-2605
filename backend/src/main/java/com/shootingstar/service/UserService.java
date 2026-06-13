package com.shootingstar.service;

import com.shootingstar.dto.user.CreateTeacherRequest;
import com.shootingstar.dto.user.UserResponse;
import com.shootingstar.entity.GlobalRole;
import com.shootingstar.entity.User;
import com.shootingstar.repository.UserRepository;
import com.shootingstar.security.UserPrincipal;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public UserResponse createTeacher(UserPrincipal principal, CreateTeacherRequest req) {
        if (principal.getGlobalRole() != GlobalRole.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email already in use");
        }

        String rawPassword = (req.getPassword() != null && !req.getPassword().isBlank())
                ? req.getPassword()
                : UUID.randomUUID().toString().substring(0, 12);

        User user = new User();
        user.setEmail(req.getEmail());
        user.setName(req.getName());
        user.setGlobalRole(GlobalRole.TEACHER);
        user.setEmailVerified(true);
        user.setPasswordHash(passwordEncoder.encode(rawPassword));

        User saved = userRepository.save(user);
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers(UserPrincipal principal) {
        if (principal.getGlobalRole() != GlobalRole.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }
        return userRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public UserResponse getUserById(UserPrincipal principal, UUID userId) {
        if (principal.getGlobalRole() != GlobalRole.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        return toResponse(user);
    }

    private UserResponse toResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getEmail(),
                user.getName(),
                user.getGlobalRole().name(),
                user.isEmailVerified(),
                user.isTotpEnabled(),
                user.getCreatedAt()
        );
    }
}

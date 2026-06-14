package com.shootingstar.security;

import com.shootingstar.entity.GlobalRole;
import com.shootingstar.entity.User;
import com.shootingstar.repository.UserRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@Order(1)
public class DataInitializer implements ApplicationRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (userRepository.findByEmail("admin@shootingstar.local").isEmpty()) {
            User admin = new User();
            admin.setEmail("admin@shootingstar.local");
            admin.setName("System Admin");
            admin.setPasswordHash(passwordEncoder.encode("Admin1234!"));
            admin.setGlobalRole(GlobalRole.ADMIN);
            admin.setEmailVerified(true);
            userRepository.save(admin);
        }

        if (userRepository.findByEmail("teacher@shootingstar.com").isEmpty()) {
            User teacher = new User();
            teacher.setEmail("teacher@shootingstar.com");
            teacher.setName("テスト教員");
            teacher.setPasswordHash(passwordEncoder.encode("Teacher1234!"));
            teacher.setGlobalRole(GlobalRole.TEACHER);
            teacher.setEmailVerified(true);
            userRepository.save(teacher);
        }
    }
}

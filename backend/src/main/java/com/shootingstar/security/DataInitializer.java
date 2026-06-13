package com.shootingstar.security;

import com.shootingstar.entity.GlobalRole;
import com.shootingstar.entity.User;
import com.shootingstar.repository.UserRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
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
    }
}

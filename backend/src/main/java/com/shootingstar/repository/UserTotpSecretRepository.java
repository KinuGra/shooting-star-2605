package com.shootingstar.repository;

import com.shootingstar.entity.User;
import com.shootingstar.entity.UserTotpSecret;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface UserTotpSecretRepository extends JpaRepository<UserTotpSecret, UUID> {
    Optional<UserTotpSecret> findByUser(User user);
    void deleteByUser(User user);
}

package com.shootingstar.repository;

import com.shootingstar.entity.User;
import com.shootingstar.entity.UserTotpBackupCode;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface UserTotpBackupCodeRepository extends JpaRepository<UserTotpBackupCode, UUID> {
    List<UserTotpBackupCode> findByUserAndUsedFalse(User user);
    void deleteByUser(User user);
}

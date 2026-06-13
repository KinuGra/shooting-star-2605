package com.shootingstar.repository;

import com.shootingstar.entity.Course;
import com.shootingstar.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CourseRepository extends JpaRepository<Course, UUID> {
    Optional<Course> findByInviteCode(String inviteCode);
    List<Course> findByOwner(User owner);
}

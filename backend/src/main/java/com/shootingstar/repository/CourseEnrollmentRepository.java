package com.shootingstar.repository;

import com.shootingstar.entity.Course;
import com.shootingstar.entity.CourseEnrollment;
import com.shootingstar.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CourseEnrollmentRepository extends JpaRepository<CourseEnrollment, UUID> {
    List<CourseEnrollment> findByCourse(Course course);
    List<CourseEnrollment> findByUser(User user);
    Optional<CourseEnrollment> findByCourseAndUser(Course course, User user);
    boolean existsByCourseAndUser(Course course, User user);
}

package com.shootingstar.repository;

import com.shootingstar.entity.Assignment;
import com.shootingstar.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface AssignmentRepository extends JpaRepository<Assignment, UUID> {
    List<Assignment> findByCourse(Course course);
    List<Assignment> findByCourseAndIsPublishedTrue(Course course);
}

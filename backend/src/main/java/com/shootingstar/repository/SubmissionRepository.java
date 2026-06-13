package com.shootingstar.repository;

import com.shootingstar.entity.Assignment;
import com.shootingstar.entity.Submission;
import com.shootingstar.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SubmissionRepository extends JpaRepository<Submission, UUID> {
    List<Submission> findByAssignment(Assignment assignment);
    List<Submission> findByAssignmentAndUser(Assignment assignment, User user);
    Optional<Submission> findTopByAssignmentAndUserOrderBySubmittedAtDesc(Assignment assignment, User user);
}

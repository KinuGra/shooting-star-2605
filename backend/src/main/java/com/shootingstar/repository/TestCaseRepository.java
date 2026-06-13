package com.shootingstar.repository;

import com.shootingstar.entity.Assignment;
import com.shootingstar.entity.TestCase;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface TestCaseRepository extends JpaRepository<TestCase, UUID> {
    List<TestCase> findByAssignmentOrderByOrderIndexAsc(Assignment assignment);
    void deleteByAssignment(Assignment assignment);
}

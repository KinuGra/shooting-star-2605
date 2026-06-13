package com.shootingstar.repository;

import com.shootingstar.entity.Assignment;
import com.shootingstar.entity.AssignmentLanguage;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface AssignmentLanguageRepository extends JpaRepository<AssignmentLanguage, UUID> {
    List<AssignmentLanguage> findByAssignment(Assignment assignment);
    void deleteByAssignment(Assignment assignment);
}

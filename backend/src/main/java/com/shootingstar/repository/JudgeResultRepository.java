package com.shootingstar.repository;

import com.shootingstar.entity.JudgeResult;
import com.shootingstar.entity.Submission;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface JudgeResultRepository extends JpaRepository<JudgeResult, UUID> {
    List<JudgeResult> findBySubmission(Submission submission);
    void deleteBySubmission(Submission submission);
}

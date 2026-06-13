package com.shootingstar.repository;

import com.shootingstar.entity.FeedbackComment;
import com.shootingstar.entity.Submission;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface FeedbackCommentRepository extends JpaRepository<FeedbackComment, UUID> {
    List<FeedbackComment> findBySubmission(Submission submission);
}

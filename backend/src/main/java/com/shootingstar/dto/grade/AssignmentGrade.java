package com.shootingstar.dto.grade;

import java.util.UUID;

public class AssignmentGrade {

    private UUID assignmentId;
    private String assignmentTitle;
    private Integer score;
    private Integer maxScore;
    private boolean submitted;
    private boolean returned;

    public AssignmentGrade(UUID assignmentId, String assignmentTitle, Integer score,
                           Integer maxScore, boolean submitted, boolean returned) {
        this.assignmentId = assignmentId;
        this.assignmentTitle = assignmentTitle;
        this.score = score;
        this.maxScore = maxScore;
        this.submitted = submitted;
        this.returned = returned;
    }

    public UUID getAssignmentId() { return assignmentId; }
    public void setAssignmentId(UUID assignmentId) { this.assignmentId = assignmentId; }

    public String getAssignmentTitle() { return assignmentTitle; }
    public void setAssignmentTitle(String assignmentTitle) { this.assignmentTitle = assignmentTitle; }

    public Integer getScore() { return score; }
    public void setScore(Integer score) { this.score = score; }

    public Integer getMaxScore() { return maxScore; }
    public void setMaxScore(Integer maxScore) { this.maxScore = maxScore; }

    public boolean isSubmitted() { return submitted; }
    public void setSubmitted(boolean submitted) { this.submitted = submitted; }

    public boolean isReturned() { return returned; }
    public void setReturned(boolean returned) { this.returned = returned; }
}

package com.shootingstar.dto.assignment;

import java.util.UUID;

public class TestCaseResponse {

    private UUID id;
    private UUID assignmentId;
    private String input;
    private String expectedOutput;
    private Integer score;
    private Integer orderIndex;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getAssignmentId() { return assignmentId; }
    public void setAssignmentId(UUID assignmentId) { this.assignmentId = assignmentId; }

    public String getInput() { return input; }
    public void setInput(String input) { this.input = input; }

    public String getExpectedOutput() { return expectedOutput; }
    public void setExpectedOutput(String expectedOutput) { this.expectedOutput = expectedOutput; }

    public Integer getScore() { return score; }
    public void setScore(Integer score) { this.score = score; }

    public Integer getOrderIndex() { return orderIndex; }
    public void setOrderIndex(Integer orderIndex) { this.orderIndex = orderIndex; }
}

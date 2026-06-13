package com.shootingstar.dto.grade;

import java.util.List;
import java.util.UUID;

public class StudentGradeResponse {

    private UUID studentId;
    private String studentName;
    private String studentEmail;
    private List<AssignmentGrade> assignmentGrades;
    private Integer totalScore;
    private Integer maxTotalScore;

    public StudentGradeResponse(UUID studentId, String studentName, String studentEmail,
                                List<AssignmentGrade> assignmentGrades,
                                Integer totalScore, Integer maxTotalScore) {
        this.studentId = studentId;
        this.studentName = studentName;
        this.studentEmail = studentEmail;
        this.assignmentGrades = assignmentGrades;
        this.totalScore = totalScore;
        this.maxTotalScore = maxTotalScore;
    }

    public UUID getStudentId() { return studentId; }
    public void setStudentId(UUID studentId) { this.studentId = studentId; }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public String getStudentEmail() { return studentEmail; }
    public void setStudentEmail(String studentEmail) { this.studentEmail = studentEmail; }

    public List<AssignmentGrade> getAssignmentGrades() { return assignmentGrades; }
    public void setAssignmentGrades(List<AssignmentGrade> assignmentGrades) { this.assignmentGrades = assignmentGrades; }

    public Integer getTotalScore() { return totalScore; }
    public void setTotalScore(Integer totalScore) { this.totalScore = totalScore; }

    public Integer getMaxTotalScore() { return maxTotalScore; }
    public void setMaxTotalScore(Integer maxTotalScore) { this.maxTotalScore = maxTotalScore; }
}

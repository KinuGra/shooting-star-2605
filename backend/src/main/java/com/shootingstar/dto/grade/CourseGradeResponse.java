package com.shootingstar.dto.grade;

import java.util.List;
import java.util.UUID;

public class CourseGradeResponse {

    private UUID courseId;
    private String courseName;
    private List<StudentGradeResponse> grades;

    public CourseGradeResponse(UUID courseId, String courseName, List<StudentGradeResponse> grades) {
        this.courseId = courseId;
        this.courseName = courseName;
        this.grades = grades;
    }

    public UUID getCourseId() { return courseId; }
    public void setCourseId(UUID courseId) { this.courseId = courseId; }

    public String getCourseName() { return courseName; }
    public void setCourseName(String courseName) { this.courseName = courseName; }

    public List<StudentGradeResponse> getGrades() { return grades; }
    public void setGrades(List<StudentGradeResponse> grades) { this.grades = grades; }
}

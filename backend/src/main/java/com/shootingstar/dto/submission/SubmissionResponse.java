package com.shootingstar.dto.submission;

import com.shootingstar.dto.judge.JudgeResultResponse;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public class SubmissionResponse {

    private UUID id;
    private UUID assignmentId;
    private String assignmentTitle;
    private UUID userId;
    private String userName;
    private String language;
    private String codeContent;
    private String fileUrl;
    private String reportContent;
    private OffsetDateTime submittedAt;
    private boolean returned;
    private OffsetDateTime returnedAt;
    private Integer score;
    private List<JudgeResultResponse> judgeResults;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getAssignmentId() { return assignmentId; }
    public void setAssignmentId(UUID assignmentId) { this.assignmentId = assignmentId; }

    public String getAssignmentTitle() { return assignmentTitle; }
    public void setAssignmentTitle(String assignmentTitle) { this.assignmentTitle = assignmentTitle; }

    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }

    public String getCodeContent() { return codeContent; }
    public void setCodeContent(String codeContent) { this.codeContent = codeContent; }

    public String getFileUrl() { return fileUrl; }
    public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }

    public String getReportContent() { return reportContent; }
    public void setReportContent(String reportContent) { this.reportContent = reportContent; }

    public OffsetDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(OffsetDateTime submittedAt) { this.submittedAt = submittedAt; }

    public boolean isReturned() { return returned; }
    public void setReturned(boolean returned) { this.returned = returned; }

    public OffsetDateTime getReturnedAt() { return returnedAt; }
    public void setReturnedAt(OffsetDateTime returnedAt) { this.returnedAt = returnedAt; }

    public Integer getScore() { return score; }
    public void setScore(Integer score) { this.score = score; }

    public List<JudgeResultResponse> getJudgeResults() { return judgeResults; }
    public void setJudgeResults(List<JudgeResultResponse> judgeResults) { this.judgeResults = judgeResults; }
}

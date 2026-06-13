package com.shootingstar.dto.submission;

public class SubmitRequest {

    private String language;
    private String codeContent;
    private String fileUrl;
    private String reportContent;

    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }

    public String getCodeContent() { return codeContent; }
    public void setCodeContent(String codeContent) { this.codeContent = codeContent; }

    public String getFileUrl() { return fileUrl; }
    public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }

    public String getReportContent() { return reportContent; }
    public void setReportContent(String reportContent) { this.reportContent = reportContent; }
}

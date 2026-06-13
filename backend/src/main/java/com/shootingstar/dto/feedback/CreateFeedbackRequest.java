package com.shootingstar.dto.feedback;

import jakarta.validation.constraints.NotBlank;

public class CreateFeedbackRequest {

    private Integer startLine;
    private Integer endLine;

    @NotBlank
    private String body;

    public Integer getStartLine() { return startLine; }
    public void setStartLine(Integer startLine) { this.startLine = startLine; }

    public Integer getEndLine() { return endLine; }
    public void setEndLine(Integer endLine) { this.endLine = endLine; }

    public String getBody() { return body; }
    public void setBody(String body) { this.body = body; }
}

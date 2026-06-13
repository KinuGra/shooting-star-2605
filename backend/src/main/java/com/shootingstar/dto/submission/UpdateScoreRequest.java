package com.shootingstar.dto.submission;

import jakarta.validation.constraints.NotNull;

public class UpdateScoreRequest {

    @NotNull
    private Integer score;

    public Integer getScore() { return score; }
    public void setScore(Integer score) { this.score = score; }
}

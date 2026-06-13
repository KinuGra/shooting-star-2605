package com.shootingstar.dto.auth;

import jakarta.validation.constraints.NotBlank;

public class EnableTotpRequest {

    @NotBlank
    private String totpCode;

    public String getTotpCode() { return totpCode; }
    public void setTotpCode(String totpCode) { this.totpCode = totpCode; }
}

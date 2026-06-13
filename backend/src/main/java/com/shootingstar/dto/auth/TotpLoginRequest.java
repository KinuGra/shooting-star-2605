package com.shootingstar.dto.auth;

import jakarta.validation.constraints.NotBlank;

public class TotpLoginRequest {

    @NotBlank
    private String tempToken;

    @NotBlank
    private String totpCode;

    public String getTempToken() { return tempToken; }
    public void setTempToken(String tempToken) { this.tempToken = tempToken; }

    public String getTotpCode() { return totpCode; }
    public void setTotpCode(String totpCode) { this.totpCode = totpCode; }
}

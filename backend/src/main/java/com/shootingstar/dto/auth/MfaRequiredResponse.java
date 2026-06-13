package com.shootingstar.dto.auth;

public class MfaRequiredResponse {

    private boolean mfaRequired = true;
    private String tempToken;

    public MfaRequiredResponse(String tempToken) {
        this.tempToken = tempToken;
    }

    public boolean isMfaRequired() { return mfaRequired; }
    public void setMfaRequired(boolean mfaRequired) { this.mfaRequired = mfaRequired; }

    public String getTempToken() { return tempToken; }
    public void setTempToken(String tempToken) { this.tempToken = tempToken; }
}

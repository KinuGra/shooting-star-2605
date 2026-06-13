package com.shootingstar.dto.auth;

import java.util.List;

public class EnableTotpResponse {

    private List<String> backupCodes;

    public EnableTotpResponse(List<String> backupCodes) {
        this.backupCodes = backupCodes;
    }

    public List<String> getBackupCodes() { return backupCodes; }
    public void setBackupCodes(List<String> backupCodes) { this.backupCodes = backupCodes; }
}

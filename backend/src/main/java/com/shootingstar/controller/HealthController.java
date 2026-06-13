package com.shootingstar.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@Tag(name = "Health", description = "ヘルスチェック")
public class HealthController {

    @GetMapping("/health")
    @Operation(summary = "ヘルスチェック", description = "サーバーの稼働状態を確認する")
    public Map<String, String> health() {
        return Map.of("status", "UP!!");
    }
}

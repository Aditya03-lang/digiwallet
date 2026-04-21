package com.example.digiwallet.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class HomeController {

    @GetMapping("/api/status")
    public Map<String, String> home() {
        return Map.of(
                "message", "Digiwallet API is running",
                "walletApi", "/api/wallets",
                "docs", "/swagger-ui/index.html"
        );
    }
}


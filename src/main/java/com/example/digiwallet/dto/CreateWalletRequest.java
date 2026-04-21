package com.example.digiwallet.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateWalletRequest(
        @NotBlank(message = "ownerName is required")
        @Size(max = 120, message = "ownerName must be at most 120 characters")
        String ownerName
) {
}


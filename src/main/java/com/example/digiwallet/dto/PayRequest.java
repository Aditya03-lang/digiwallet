package com.example.digiwallet.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record PayRequest(
        @NotNull(message = "fromWalletId is required")
        Long fromWalletId,

        @NotNull(message = "toWalletId is required")
        Long toWalletId,

        @NotNull(message = "amount is required")
        @DecimalMin(value = "0.01", message = "amount must be greater than 0")
        BigDecimal amount,

        @Size(max = 255, message = "note must be at most 255 characters")
        String note
) {
}


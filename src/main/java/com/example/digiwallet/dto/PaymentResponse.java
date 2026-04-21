package com.example.digiwallet.dto;

import java.math.BigDecimal;

public record PaymentResponse(
        String referenceId,
        Long fromWalletId,
        Long toWalletId,
        BigDecimal amount,
        BigDecimal fromWalletBalance,
        BigDecimal toWalletBalance
) {
}


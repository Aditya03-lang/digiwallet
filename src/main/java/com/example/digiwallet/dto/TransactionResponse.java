package com.example.digiwallet.dto;

import com.example.digiwallet.domain.TransactionStatus;
import com.example.digiwallet.domain.TransactionType;

import java.math.BigDecimal;
import java.time.Instant;

public record TransactionResponse(
        String referenceId,
        Long fromWalletId,
        Long toWalletId,
        BigDecimal amount,
        TransactionType type,
        TransactionStatus status,
        String description,
        Instant createdAt
) {
}


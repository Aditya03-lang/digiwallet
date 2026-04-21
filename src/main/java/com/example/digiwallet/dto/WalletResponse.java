package com.example.digiwallet.dto;

import java.math.BigDecimal;

public record WalletResponse(
        Long walletId,
        String ownerName,
        BigDecimal balance
) {
}


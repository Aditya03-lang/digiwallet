package com.example.digiwallet.controller;

import com.example.digiwallet.dto.CreateWalletRequest;
import com.example.digiwallet.dto.MoneyRequest;
import com.example.digiwallet.dto.PayRequest;
import com.example.digiwallet.dto.PaymentResponse;
import com.example.digiwallet.dto.TransactionResponse;
import com.example.digiwallet.dto.WalletResponse;
import com.example.digiwallet.service.WalletService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/wallets")
public class WalletController {

    private final WalletService walletService;

    public WalletController(WalletService walletService) {
        this.walletService = walletService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public WalletResponse createWallet(@Valid @RequestBody CreateWalletRequest request) {
        return walletService.createWallet(request);
    }

    @GetMapping("/{walletId}")
    public WalletResponse getWallet(@PathVariable Long walletId) {
        return walletService.getWallet(walletId);
    }

    @GetMapping("/{walletId}/balance")
    public WalletResponse getBalance(@PathVariable Long walletId) {
        return walletService.getWallet(walletId);
    }

    @PostMapping("/{walletId}/add-money")
    public WalletResponse addMoney(@PathVariable Long walletId, @Valid @RequestBody MoneyRequest request) {
        return walletService.addMoney(walletId, request);
    }

    @PostMapping("/pay")
    public PaymentResponse pay(@Valid @RequestBody PayRequest request) {
        return walletService.pay(request);
    }

    @GetMapping("/{walletId}/transactions")
    public List<TransactionResponse> getWalletTransactions(@PathVariable Long walletId) {
        return walletService.getWalletTransactions(walletId);
    }
}


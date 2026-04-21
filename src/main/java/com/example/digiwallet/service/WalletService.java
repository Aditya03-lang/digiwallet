package com.example.digiwallet.service;

import com.example.digiwallet.domain.TransactionStatus;
import com.example.digiwallet.domain.TransactionType;
import com.example.digiwallet.domain.Wallet;
import com.example.digiwallet.domain.WalletTransaction;
import com.example.digiwallet.dto.CreateWalletRequest;
import com.example.digiwallet.dto.MoneyRequest;
import com.example.digiwallet.dto.PayRequest;
import com.example.digiwallet.dto.PaymentResponse;
import com.example.digiwallet.dto.TransactionResponse;
import com.example.digiwallet.dto.WalletResponse;
import com.example.digiwallet.exception.BadRequestException;
import com.example.digiwallet.exception.NotFoundException;
import com.example.digiwallet.repository.WalletRepository;
import com.example.digiwallet.repository.WalletTransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
public class WalletService {

    private static final int SCALE = 2;

    private final WalletRepository walletRepository;
    private final WalletTransactionRepository walletTransactionRepository;

    public WalletService(WalletRepository walletRepository, WalletTransactionRepository walletTransactionRepository) {
        this.walletRepository = walletRepository;
        this.walletTransactionRepository = walletTransactionRepository;
    }

    @Transactional
    public WalletResponse createWallet(CreateWalletRequest request) {
        if (walletRepository.existsByOwnerNameIgnoreCase(request.ownerName())) {
            throw new BadRequestException("Wallet already exists for owner: " + request.ownerName());
        }

        Wallet wallet = new Wallet();
        wallet.setOwnerName(request.ownerName().trim());
        wallet.setBalance(BigDecimal.ZERO.setScale(SCALE, RoundingMode.HALF_UP));

        Wallet saved = walletRepository.save(wallet);
        return toWalletResponse(saved);
    }

    @Transactional(readOnly = true)
    public WalletResponse getWallet(Long walletId) {
        Wallet wallet = walletRepository.findById(walletId)
                .orElseThrow(() -> new NotFoundException("Wallet not found: " + walletId));
        return toWalletResponse(wallet);
    }

    @Transactional
    public WalletResponse addMoney(Long walletId, MoneyRequest request) {
        Wallet wallet = walletRepository.findByIdForUpdate(walletId)
                .orElseThrow(() -> new NotFoundException("Wallet not found: " + walletId));

        BigDecimal amount = normalizeAmount(request.amount());
        wallet.setBalance(wallet.getBalance().add(amount));

        WalletTransaction transaction = new WalletTransaction();
        transaction.setToWalletId(walletId);
        transaction.setAmount(amount);
        transaction.setType(TransactionType.ADD_MONEY);
        transaction.setStatus(TransactionStatus.SUCCESS);
        transaction.setDescription(sanitizeNote(request.note(), "Wallet top-up"));
        walletTransactionRepository.save(transaction);

        return toWalletResponse(wallet);
    }

    @Transactional
    public PaymentResponse pay(PayRequest request) {
        if (request.fromWalletId().equals(request.toWalletId())) {
            throw new BadRequestException("Source and destination wallets must be different");
        }

        Long sourceId = request.fromWalletId();
        Long destinationId = request.toWalletId();
        BigDecimal amount = normalizeAmount(request.amount());

        // Lock wallets in a stable order to avoid deadlocks on concurrent payments.
        Long firstId = Math.min(sourceId, destinationId);
        Long secondId = Math.max(sourceId, destinationId);

        Wallet firstWallet = walletRepository.findByIdForUpdate(firstId)
                .orElseThrow(() -> new NotFoundException("Wallet not found: " + firstId));
        Wallet secondWallet = walletRepository.findByIdForUpdate(secondId)
                .orElseThrow(() -> new NotFoundException("Wallet not found: " + secondId));

        Wallet sourceWallet = sourceId.equals(firstId) ? firstWallet : secondWallet;
        Wallet destinationWallet = destinationId.equals(firstId) ? firstWallet : secondWallet;

        if (sourceWallet.getBalance().compareTo(amount) < 0) {
            throw new BadRequestException("Insufficient balance in wallet: " + sourceId);
        }

        sourceWallet.setBalance(sourceWallet.getBalance().subtract(amount));
        destinationWallet.setBalance(destinationWallet.getBalance().add(amount));

        WalletTransaction transaction = new WalletTransaction();
        transaction.setFromWalletId(sourceId);
        transaction.setToWalletId(destinationId);
        transaction.setAmount(amount);
        transaction.setType(TransactionType.PAYMENT);
        transaction.setStatus(TransactionStatus.SUCCESS);
        transaction.setDescription(sanitizeNote(request.note(), "P2P payment"));
        WalletTransaction saved = walletTransactionRepository.save(transaction);

        return new PaymentResponse(
                saved.getReferenceId(),
                sourceId,
                destinationId,
                amount,
                sourceWallet.getBalance(),
                destinationWallet.getBalance()
        );
    }

    @Transactional(readOnly = true)
    public List<TransactionResponse> getWalletTransactions(Long walletId) {
        if (!walletRepository.existsById(walletId)) {
            throw new NotFoundException("Wallet not found: " + walletId);
        }

        return walletTransactionRepository
                .findByFromWalletIdOrToWalletIdOrderByCreatedAtDesc(walletId, walletId)
                .stream()
                .map(this::toTransactionResponse)
                .toList();
    }

    private WalletResponse toWalletResponse(Wallet wallet) {
        return new WalletResponse(wallet.getId(), wallet.getOwnerName(), wallet.getBalance());
    }

    private TransactionResponse toTransactionResponse(WalletTransaction transaction) {
        return new TransactionResponse(
                transaction.getReferenceId(),
                transaction.getFromWalletId(),
                transaction.getToWalletId(),
                transaction.getAmount(),
                transaction.getType(),
                transaction.getStatus(),
                transaction.getDescription(),
                transaction.getCreatedAt()
        );
    }

    private BigDecimal normalizeAmount(BigDecimal amount) {
        if (amount == null) {
            throw new BadRequestException("amount is required");
        }
        return amount.setScale(SCALE, RoundingMode.HALF_UP);
    }

    private String sanitizeNote(String note, String fallback) {
        if (note == null || note.isBlank()) {
            return fallback;
        }
        return note.trim();
    }
}


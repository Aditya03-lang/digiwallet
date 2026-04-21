package com.example.digiwallet;

import com.example.digiwallet.dto.CreateWalletRequest;
import com.example.digiwallet.dto.MoneyRequest;
import com.example.digiwallet.dto.PayRequest;
import com.example.digiwallet.dto.PaymentResponse;
import com.example.digiwallet.dto.WalletResponse;
import com.example.digiwallet.service.WalletService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Transactional
class WalletControllerIntegrationTest {

    @Autowired
    private WalletService walletService;

    @Test
    void shouldCreateWalletTopUpAndPay() {
        WalletResponse alice = walletService.createWallet(new CreateWalletRequest("Alice"));
        WalletResponse bob = walletService.createWallet(new CreateWalletRequest("Bob"));

        WalletResponse fundedAlice = walletService.addMoney(
                alice.walletId(),
                new MoneyRequest(new BigDecimal("1000.00"), "Initial load")
        );
        assertThat(fundedAlice.balance()).isEqualByComparingTo("1000.00");

        PaymentResponse payment = walletService.pay(new PayRequest(
                alice.walletId(),
                bob.walletId(),
                new BigDecimal("250.00"),
                "Dinner"
        ));

        assertThat(payment.amount()).isEqualByComparingTo("250.00");
        assertThat(payment.fromWalletBalance()).isEqualByComparingTo("750.00");
        assertThat(payment.toWalletBalance()).isEqualByComparingTo("250.00");

        WalletResponse refreshedAlice = walletService.getWallet(alice.walletId());
        WalletResponse refreshedBob = walletService.getWallet(bob.walletId());

        assertThat(refreshedAlice.balance()).isEqualByComparingTo("750.00");
        assertThat(refreshedBob.balance()).isEqualByComparingTo("250.00");
    }
}


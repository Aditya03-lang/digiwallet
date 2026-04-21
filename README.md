# Digiwallet Mini Project (FinTech Wallet)

A Java Spring Boot REST API for a Digital Wallet System.

## Features

- Create wallet
- Check wallet details and balance
- Add money to wallet
- Pay from one wallet to another (P2P)
- View wallet transaction history
- H2 in-memory database for local demo

## Tech Stack

- Java 21
- Spring Boot
- Spring Web MVC
- Spring Data JPA
- Spring Security (open for local project testing)
- H2 Database

## REST APIs

- `POST /api/wallets` -> create wallet
- `GET /api/wallets/{walletId}` -> wallet details
- `GET /api/wallets/{walletId}/balance` -> wallet balance
- `POST /api/wallets/{walletId}/add-money` -> add money
- `POST /api/wallets/pay` -> transfer money wallet-to-wallet
- `GET /api/wallets/{walletId}/transactions` -> wallet transactions

## Quick Run

```bash
./mvnw spring-boot:run
```

On Windows PowerShell:

```powershell
.\mvnw.cmd spring-boot:run
```

## Test

```bash
./mvnw test
```

On Windows PowerShell:

```powershell
.\mvnw.cmd test
```

## Sample Payloads

Create wallet:

```json
{
  "ownerName": "Alice"
}
```

Add money:

```json
{
  "amount": 1000.00,
  "note": "Initial wallet funding"
}
```

Pay:

```json
{
  "fromWalletId": 1,
  "toWalletId": 2,
  "amount": 250.00,
  "note": "Bill split"
}
```


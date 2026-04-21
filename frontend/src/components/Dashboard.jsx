import { useWallet } from '../context/WalletContext';
import {
  CurrencyDollar,
  ArrowsClockwise,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowsLeftRight,
  Plus,
  PaperPlaneTilt,
  CheckCircle,
  XCircle,
  Clock,
} from '@phosphor-icons/react';

export default function Dashboard({ setModal }) {
  const { wallet, transactions, loadTransactions, loading } = useWallet();

  const handleRefresh = () => {
    loadTransactions(wallet.walletId);
  };

  return (
    <div className="dashboard-grid">
      {/* Balance Card */}
      <div className="glass-card balance-card">
        <div className="card-header">
          <span className="card-label">Total Balance</span>
          <div className="card-icon-wrap">
            <CurrencyDollar size={20} weight="bold" />
          </div>
        </div>
        <div className="balance-amount">
          <span className="balance-currency">$</span>
          {Number(wallet.balance).toFixed(2)}
        </div>
        <div className="wallet-owner-tag">
          <span className="owner-dot" />
          {wallet.ownerName} &nbsp;·&nbsp; ID #{wallet.walletId}
        </div>
        <div className="balance-actions">
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setModal('addMoney')}
            disabled={loading}
          >
            <Plus size={16} weight="bold" /> Add Funds
          </button>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setModal('pay')}
            disabled={loading}
          >
            <PaperPlaneTilt size={16} weight="bold" /> Send
          </button>
        </div>
      </div>

      {/* Transactions Card */}
      <div className="glass-card transactions-card">
        <div className="card-header">
          <div>
            <h3>Recent Transactions</h3>
            <p className="card-sub">{transactions.length} transaction{transactions.length !== 1 ? 's' : ''}</p>
          </div>
          <button
            className="btn-icon"
            onClick={handleRefresh}
            disabled={loading}
            title="Refresh transactions"
          >
            <ArrowsClockwise size={20} className={loading ? 'spin' : ''} />
          </button>
        </div>
        <div className="transactions-list">
          {transactions.length === 0 ? (
            <div className="empty-transactions">
              <ArrowsLeftRight size={36} weight="light" />
              <p>No transactions yet</p>
              <span>Add funds or send money to get started</span>
            </div>
          ) : (
            transactions.map((tx) => (
              <TransactionItem
                key={tx.referenceId}
                tx={tx}
                walletId={wallet.walletId}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  if (status === 'SUCCESS') {
    return (
      <span className="status-badge success">
        <CheckCircle size={12} weight="fill" /> Success
      </span>
    );
  }
  if (status === 'FAILED') {
    return (
      <span className="status-badge failed">
        <XCircle size={12} weight="fill" /> Failed
      </span>
    );
  }
  return (
    <span className="status-badge pending">
      <Clock size={12} weight="fill" /> Pending
    </span>
  );
}

function TransactionItem({ tx, walletId }) {
  const date = new Date(tx.createdAt).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  let iconClass, IconComp, amountClass, sign, typeLabel;

  if (tx.type === 'ADD_MONEY' || tx.type === 'DEPOSIT') {
    iconClass = 'deposit';
    IconComp = ArrowDownLeft;
    amountClass = 'positive';
    sign = '+';
    typeLabel = 'Deposit';
  } else if (tx.type === 'WITHDRAWAL') {
    iconClass = 'withdraw';
    IconComp = ArrowUpRight;
    amountClass = 'negative';
    sign = '-';
    typeLabel = 'Withdrawal';
  } else {
    // PAYMENT — determine direction relative to current wallet
    const isIncoming = tx.toWalletId === walletId;
    iconClass = isIncoming ? 'deposit' : 'transfer';
    IconComp = isIncoming ? ArrowDownLeft : ArrowsLeftRight;
    amountClass = isIncoming ? 'positive' : 'negative';
    sign = isIncoming ? '+' : '-';
    typeLabel = isIncoming
      ? `From Wallet #${tx.fromWalletId}`
      : `To Wallet #${tx.toWalletId}`;
  }

  const txNote = tx.description;
  // Truncate UUID for display — show first 8 chars
  const shortId = tx.referenceId ? tx.referenceId.substring(0, 8).toUpperCase() : '—';

  return (
    <div className="transaction-item">
      <div className="tx-info">
        <div className={`tx-icon ${iconClass}`}>
          <IconComp size={18} weight="bold" />
        </div>
        <div className="tx-details">
          <div className="tx-type">
            {typeLabel}
            {txNote ? <span className="tx-note"> · {txNote}</span> : null}
          </div>
          <div className="tx-meta">
            <span className="tx-date">{date}</span>
            <span className="tx-id" title={tx.referenceId}>#{shortId}</span>
          </div>
        </div>
      </div>
      <div className="tx-right">
        <div className={`tx-amount ${amountClass}`}>
          {sign}${Number(tx.amount).toFixed(2)}
        </div>
        <StatusBadge status={tx.status} />
      </div>
    </div>
  );
}

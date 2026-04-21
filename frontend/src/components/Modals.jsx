import { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { X, SpinnerGap } from '@phosphor-icons/react';

export default function Modals({ activeModal, onClose }) {
  if (!activeModal) return null;

  const titles = {
    create: 'Create New Wallet',
    load: 'Load Wallet',
    addMoney: 'Add Funds',
    pay: 'Send Money',
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{titles[activeModal]}</h2>
          <button className="btn-close" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>
        <div className="modal-body">
          {activeModal === 'create' && <CreateWalletForm onClose={onClose} />}
          {activeModal === 'load' && <LoadWalletForm onClose={onClose} />}
          {activeModal === 'addMoney' && <AddMoneyForm onClose={onClose} />}
          {activeModal === 'pay' && <PayForm onClose={onClose} />}
        </div>
      </div>
    </div>
  );
}

/* ── Shared helpers ── */

function SubmitButton({ loading, label, loadingLabel }) {
  return (
    <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
      {loading ? (
        <>
          <SpinnerGap size={18} className="spin" /> {loadingLabel || 'Processing…'}
        </>
      ) : (
        label
      )}
    </button>
  );
}

function FieldError({ message }) {
  if (!message) return null;
  return <p className="field-error">{message}</p>;
}

/* ── Forms ── */

function CreateWalletForm({ onClose }) {
  const { createWallet, loading } = useWallet();
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Owner name is required.');
      return;
    }
    if (trimmed.length > 120) {
      setError('Name must be 120 characters or fewer.');
      return;
    }
    setError('');
    const ok = await createWallet(trimmed);
    if (ok) onClose();
  };

  return (
    <form onSubmit={submit} noValidate>
      <div className="form-group">
        <label htmlFor="create-name">Owner Name</label>
        <input
          id="create-name"
          autoFocus
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (error) setError('');
          }}
          placeholder="Enter your full name"
          maxLength={120}
          disabled={loading}
        />
        <FieldError message={error} />
      </div>
      <SubmitButton loading={loading} label="Create Wallet" loadingLabel="Creating…" />
    </form>
  );
}

function LoadWalletForm({ onClose }) {
  const { loadWallet, loading } = useWallet();
  const [id, setId] = useState('');
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    const parsed = parseInt(id, 10);
    if (!id || isNaN(parsed) || parsed <= 0) {
      setError('Please enter a valid wallet ID (positive number).');
      return;
    }
    setError('');
    const ok = await loadWallet(parsed);
    if (ok) onClose();
    // If not ok, keep modal open so user can try again
  };

  return (
    <form onSubmit={submit} noValidate>
      <div className="form-group">
        <label htmlFor="load-id">Wallet ID</label>
        <input
          id="load-id"
          autoFocus
          type="number"
          min="1"
          value={id}
          onChange={(e) => {
            setId(e.target.value);
            if (error) setError('');
          }}
          placeholder="Enter Wallet ID"
          disabled={loading}
        />
        <FieldError message={error} />
      </div>
      <SubmitButton loading={loading} label="Load Wallet" loadingLabel="Loading…" />
    </form>
  );
}

function AddMoneyForm({ onClose }) {
  const { addMoney, loading } = useWallet();
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    const parsed = parseFloat(amount);
    if (!amount || isNaN(parsed) || parsed < 0.01) {
      setError('Amount must be at least $0.01.');
      return;
    }
    setError('');
    const ok = await addMoney(parsed, note.trim() || undefined);
    if (ok) onClose();
  };

  return (
    <form onSubmit={submit} noValidate>
      <div className="form-group">
        <label htmlFor="add-amount">Amount ($)</label>
        <input
          id="add-amount"
          autoFocus
          type="number"
          step="0.01"
          min="0.01"
          value={amount}
          onChange={(e) => {
            setAmount(e.target.value);
            if (error) setError('');
          }}
          placeholder="0.00"
          disabled={loading}
        />
        <FieldError message={error} />
      </div>
      <div className="form-group">
        <label htmlFor="add-note">Note <span className="label-optional">(optional)</span></label>
        <input
          id="add-note"
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. Bank transfer"
          maxLength={255}
          disabled={loading}
        />
      </div>
      <SubmitButton loading={loading} label="Add Funds" loadingLabel="Adding…" />
    </form>
  );
}

function PayForm({ onClose }) {
  const { pay, wallet, loading } = useWallet();
  const [toWalletId, setToWalletId] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    const parsedId = parseInt(toWalletId, 10);
    if (!toWalletId || isNaN(parsedId) || parsedId <= 0) {
      errs.toWalletId = 'Please enter a valid recipient wallet ID.';
    } else if (parsedId === wallet?.walletId) {
      errs.toWalletId = 'You cannot send money to your own wallet.';
    }
    const parsedAmt = parseFloat(amount);
    if (!amount || isNaN(parsedAmt) || parsedAmt < 0.01) {
      errs.amount = 'Amount must be at least $0.01.';
    } else if (wallet && parsedAmt > Number(wallet.balance)) {
      errs.amount = `Insufficient balance. Available: $${Number(wallet.balance).toFixed(2)}`;
    }
    return errs;
  };

  const submit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    const ok = await pay(parseInt(toWalletId, 10), parseFloat(amount), note.trim() || undefined);
    if (ok) onClose();
  };

  return (
    <form onSubmit={submit} noValidate>
      <div className="form-group">
        <label htmlFor="pay-to">Recipient Wallet ID</label>
        <input
          id="pay-to"
          autoFocus
          type="number"
          min="1"
          value={toWalletId}
          onChange={(e) => {
            setToWalletId(e.target.value);
            if (errors.toWalletId) setErrors((p) => ({ ...p, toWalletId: '' }));
          }}
          placeholder="Enter recipient's wallet ID"
          disabled={loading}
        />
        <FieldError message={errors.toWalletId} />
      </div>
      <div className="form-group">
        <label htmlFor="pay-amount">Amount ($)</label>
        <input
          id="pay-amount"
          type="number"
          step="0.01"
          min="0.01"
          value={amount}
          onChange={(e) => {
            setAmount(e.target.value);
            if (errors.amount) setErrors((p) => ({ ...p, amount: '' }));
          }}
          placeholder="0.00"
          disabled={loading}
        />
        <FieldError message={errors.amount} />
      </div>
      <div className="form-group">
        <label htmlFor="pay-note">Note <span className="label-optional">(optional)</span></label>
        <input
          id="pay-note"
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. Dinner split"
          maxLength={255}
          disabled={loading}
        />
      </div>
      <SubmitButton loading={loading} label="Send Payment" loadingLabel="Sending…" />
    </form>
  );
}

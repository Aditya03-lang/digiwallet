import { useWallet } from '../context/WalletContext';
import { CheckCircle, XCircle } from '@phosphor-icons/react';

export default function ToastContainer() {
  const { toasts } = useWallet();

  return (
    <div className="toast-container" role="region" aria-live="polite" aria-label="Notifications">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast ${toast.type}`} role="alert">
          {toast.type === 'success' ? (
            <CheckCircle size={20} weight="fill" aria-hidden="true" />
          ) : (
            <XCircle size={20} weight="fill" aria-hidden="true" />
          )}
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  );
}

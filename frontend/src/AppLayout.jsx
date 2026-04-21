import { useState } from 'react';
import { useWallet } from './context/WalletContext';
import {
  Wallet,
  SquaresFour,
  PlusCircle,
  FolderOpen,
  User,
  List,
  X,
  ShieldCheck,
  Lightning,
  ArrowsLeftRight,
} from '@phosphor-icons/react';
import Dashboard from './components/Dashboard';
import Modals from './components/Modals';
import ToastContainer from './components/ToastContainer';

export default function AppLayout() {
  const { wallet } = useWallet();
  const [activeModal, setActiveModal] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-container">
      <ToastContainer />

      {sidebarOpen && (
        <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`sidebar${sidebarOpen ? ' sidebar-open' : ''}`}>
        <div className="logo">
          <Wallet className="logo-icon" weight="fill" size={26} />
          <span className="logo-text">DigiWallet</span>
          <button
            className="sidebar-close"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="nav">
          <p className="nav-section-label">Menu</p>
          <button className="nav-link active" onClick={() => setSidebarOpen(false)}>
            <SquaresFour size={19} weight="bold" /> Dashboard
          </button>
          <button
            className="nav-link"
            onClick={() => { setActiveModal('create'); setSidebarOpen(false); }}
          >
            <PlusCircle size={19} /> New Wallet
          </button>
          <button
            className="nav-link"
            onClick={() => { setActiveModal('load'); setSidebarOpen(false); }}
          >
            <FolderOpen size={19} /> Load Wallet
          </button>
        </nav>

        {wallet && (
          <div className="user-info">
            <div className="avatar">
              <User weight="fill" size={17} />
            </div>
            <div className="details">
              <div className="name" title={wallet.ownerName}>{wallet.ownerName}</div>
              <div className="wallet-id">Wallet #{wallet.walletId}</div>
            </div>
          </div>
        )}
      </aside>

      <main className="content">
        <header>
          <div className="header-left">
            <button
              className="btn-icon mobile-menu-btn"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <List size={22} />
            </button>
            <div className="header-title">
              <h1>{wallet ? 'Overview' : 'Welcome back'}</h1>
              <p>{wallet ? `Logged in as ${wallet.ownerName}` : 'Your digital financial hub'}</p>
            </div>
          </div>
          <div className="header-actions">
            {!wallet ? (
              <button className="btn btn-outline btn-sm" onClick={() => setActiveModal('load')}>
                Load Wallet
              </button>
            ) : (
              <button className="btn btn-outline btn-sm" onClick={() => setActiveModal('load')}>
                Switch Wallet
              </button>
            )}
          </div>
        </header>

        {wallet ? (
          <Dashboard setModal={setActiveModal} />
        ) : (
          <div className="state-container">
            <div className="empty-state">
              <div className="empty-icon-wrap">
                <Wallet weight="fill" size={44} />
              </div>
              <h2>No Wallet Loaded</h2>
              <p>
                Create a new digital wallet or load an existing one to start
                managing your funds securely.
              </p>
              <div className="action-buttons">
                <button className="btn btn-primary" onClick={() => setActiveModal('create')}>
                  <PlusCircle size={17} weight="bold" /> Create Wallet
                </button>
                <button className="btn btn-secondary" onClick={() => setActiveModal('load')}>
                  <FolderOpen size={17} /> Load Existing
                </button>
              </div>
              <div className="feature-pills">
                <span className="feature-pill">
                  <ShieldCheck size={13} weight="fill" /> Secure
                </span>
                <span className="feature-pill">
                  <Lightning size={13} weight="fill" /> Instant transfers
                </span>
                <span className="feature-pill">
                  <ArrowsLeftRight size={13} weight="bold" /> P2P payments
                </span>
              </div>
            </div>
          </div>
        )}
      </main>

      <Modals activeModal={activeModal} onClose={() => setActiveModal(null)} />
    </div>
  );
}

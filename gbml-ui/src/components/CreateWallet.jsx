import { useState } from 'react'
import axios from 'axios'

import { API_BASE_URL } from '../config'

export default function CreateWallet({ userId, onWalletCreated }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [walletData, setWalletData] = useState(null)
  const [copiedField, setCopiedField] = useState(null)

  const copyToClipboard = async (text, field) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const createWallet = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await axios.post(`${API_BASE_URL}/wallets`, { userId })
      setWalletData(response.data)
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to create wallet'
      setError(errorMessage)
      console.error('Error creating wallet:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleContinue = () => {
    if (onWalletCreated) {
      onWalletCreated()
    }
  }

  if (walletData) {
    return (
      <div className="create-wallet">
        <div className="wallet-created-card">
          <div className="wallet-icon">✅</div>
          <h2>Wallet Created Successfully!</h2>

          <div className="wallet-credential">
            <label>Wallet Address</label>
            <div className="credential-row">
              <code className="credential-value">{walletData.walletAddress}</code>
              <button
                className="copy-button"
                onClick={() => copyToClipboard(walletData.walletAddress, 'address')}
              >
                {copiedField === 'address' ? '✓ Copied' : '📋 Copy'}
              </button>
            </div>
          </div>

          <div className="wallet-credential">
            <label>Private Key</label>
            <div className="credential-row">
              <code className="credential-value">{walletData.privateKey}</code>
              <button
                className="copy-button"
                onClick={() => copyToClipboard(walletData.privateKey, 'privateKey')}
              >
                {copiedField === 'privateKey' ? '✓ Copied' : '📋 Copy'}
              </button>
            </div>
          </div>

          <div className="warning-message">
            <strong>⚠️ WARNING:</strong> Save your private key now! It will NOT be shown again.
            Anyone with your private key can access your funds.
          </div>

          <button className="continue-button" onClick={handleContinue}>
            I've Saved My Keys — Continue to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="create-wallet">
      <div className="create-wallet-card">
        <div className="wallet-icon">🔐</div>
        <h2>Create Your Wallet</h2>
        <p className="wallet-description">
          You don't have a blockchain wallet yet. Create one to send and receive
          tokens on the GBML network.
        </p>
        <ul className="wallet-features">
          <li>🔒 Secure key generation</li>
          <li>💸 Send and receive tokens</li>
          <li>📊 Track your transaction history</li>
        </ul>

        <button
          onClick={createWallet}
          disabled={loading}
          className="create-wallet-button"
        >
          {loading ? 'Creating Wallet...' : 'Create My Wallet'}
        </button>

        {error && (
          <div className="error-message">
            <strong>Error:</strong> {error}
          </div>
        )}
      </div>
    </div>
  )
}

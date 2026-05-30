import { useState } from 'react'

export default function WalletInfo({ walletAddress }) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(walletAddress)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className="wallet-info-card">
      <div className="wallet-info-header">
        <span className="wallet-icon">💳</span>
        <h3>Your Wallet</h3>
      </div>
      <div className="wallet-address-row">
        <code className="wallet-address">{walletAddress}</code>
        <button className="copy-button" onClick={copyToClipboard}>
          {copied ? '✓ Copied' : '📋 Copy'}
        </button>
      </div>
    </div>
  )
}

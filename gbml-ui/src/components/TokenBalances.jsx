import { useState, useEffect } from 'react'
import axios from 'axios'

import { API_BASE_URL } from '../config'

export default function TokenBalances({ walletAddress }) {
  const [balances, setBalances] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchBalances = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await axios.get(`${API_BASE_URL}/wallets/${walletAddress}/balances`)
      setBalances(response.data)
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch balances'
      setError(errorMessage)
      console.error('Error fetching balances:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (walletAddress) {
      fetchBalances()
    }
  }, [walletAddress])

  const truncateAddress = (addr) => {
    if (!addr) return ''
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  if (loading) {
    return (
      <div className="token-balances">
        <h3>Token Balances</h3>
        <div className="loading-spinner">Loading balances...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="token-balances">
        <div className="token-balances-header">
          <h3>Token Balances</h3>
          <button className="refresh-button" onClick={fetchBalances}>🔄 Refresh</button>
        </div>
        <div className="error-message">
          <strong>Error:</strong> {error}
        </div>
      </div>
    )
  }

  return (
    <div className="token-balances">
      <div className="token-balances-header">
        <h3>Token Balances</h3>
        <button className="refresh-button" onClick={fetchBalances}>🔄 Refresh</button>
      </div>

      {balances?.nativeBalance !== undefined && (
        <div className="native-balance-card">
          <span className="native-balance-label">JVD Native Balance</span>
          <span className="native-balance-value">{balances.nativeBalance} JVD</span>
        </div>
      )}

      {balances?.tokens && balances.tokens.length > 0 ? (
        <div className="token-grid">
          {balances.tokens.map((token, index) => (
            <div className="token-card" key={index}>
              <div className="token-card-header">
                <span className="token-name">{token.name || 'Unknown Token'}</span>
                <span className="token-symbol">{token.symbol || '???'}</span>
              </div>
              <div className="token-balance">{token.balance}</div>
              <div className="token-contract" title={token.contractAddress}>
                {truncateAddress(token.contractAddress)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <p>No ERC20 tokens found in this wallet.</p>
        </div>
      )}
    </div>
  )
}

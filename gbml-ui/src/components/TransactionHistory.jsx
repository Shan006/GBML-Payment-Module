import { useState, useEffect, useRef } from 'react'
import axios from 'axios'

import { API_BASE_URL } from '../config'

export default function TransactionHistory({ walletAddress }) {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [copiedHash, setCopiedHash] = useState(null)
  const intervalRef = useRef(null)

  const fetchTransactions = async () => {
    setError(null)

    try {
      const response = await axios.get(`${API_BASE_URL}/wallets/${walletAddress}/transactions`)
      setTransactions(response.data.transactions || response.data || [])
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch transactions'
      setError(errorMessage)
      console.error('Error fetching transactions:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (walletAddress) {
      fetchTransactions()
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [walletAddress])

  // Auto-refresh every 10 seconds if any PROCESSING transactions exist
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    const hasProcessing = transactions.some(
      (tx) => tx.status === 'PROCESSING'
    )

    if (hasProcessing) {
      intervalRef.current = setInterval(fetchTransactions, 10000)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [transactions])

  const truncateHash = (hash) => {
    if (!hash) return ''
    return `${hash.slice(0, 8)}...${hash.slice(-6)}`
  }

  const truncateAddress = (addr) => {
    if (!addr) return ''
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const copyToClipboard = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedHash(id)
      setTimeout(() => setCopiedHash(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const getStatusClass = (status) => {
    switch (status) {
      case 'PROCESSING':
        return 'status-processing'
      case 'SUCCESS':
        return 'status-success'
      case 'FAILED':
        return 'status-failed'
      default:
        return ''
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    const date = new Date(dateStr)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
  }

  if (loading) {
    return (
      <div className="transaction-history">
        <h3>Transaction History</h3>
        <div className="loading-spinner">Loading transactions...</div>
      </div>
    )
  }

  return (
    <div className="transaction-history">
      <div className="transaction-history-header">
        <h3>Transaction History</h3>
        <button className="refresh-button" onClick={fetchTransactions}>🔄 Refresh</button>
      </div>

      {error && (
        <div className="error-message">
          <strong>Error:</strong> {error}
        </div>
      )}

      {transactions.length === 0 ? (
        <div className="empty-state">
          <p>No transactions yet. Send some tokens to get started!</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="transaction-table">
            <thead>
              <tr>
                <th>Token Address</th>
                <th>Amount</th>
                <th>Tx Hash</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx, index) => (
                <tr key={tx.txHash || index}>
                  <td title={tx.tokenAddress}>
                    {truncateAddress(tx.tokenAddress)}
                  </td>
                  <td>{tx.amount}</td>
                  <td>
                    <span className="tx-hash-cell">
                      <code title={tx.txHash}>{truncateHash(tx.txHash)}</code>
                      {tx.txHash && (
                        <button
                          className="copy-button-small"
                          onClick={() => copyToClipboard(tx.txHash, index)}
                        >
                          {copiedHash === index ? '✓' : '📋'}
                        </button>
                      )}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${getStatusClass(tx.status)}`}>
                      {tx.status}
                    </span>
                  </td>
                  <td>{formatDate(tx.createdAt || tx.date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

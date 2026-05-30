import { useState } from 'react'
import axios from 'axios'

import { API_BASE_URL } from '../config'

const ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/

export default function SendTokens({ fromAddress }) {
  const [to, setTo] = useState('')
  const [tokenAddress, setTokenAddress] = useState('')
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const validate = () => {
    if (!to || !tokenAddress || !amount) {
      return 'All fields are required.'
    }
    if (!ADDRESS_REGEX.test(to)) {
      return 'Recipient address must be a valid Ethereum address (0x + 40 hex characters).'
    }
    if (!ADDRESS_REGEX.test(tokenAddress)) {
      return 'Token address must be a valid Ethereum address (0x + 40 hex characters).'
    }
    if (isNaN(Number(amount)) || Number(amount) <= 0) {
      return 'Amount must be a number greater than 0.'
    }
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)

    try {
      const response = await axios.post(`${API_BASE_URL}/wallets/transfer`, {
        from: fromAddress,
        to,
        tokenAddress,
        amount: Number(amount)
      })

      setSuccess(response.data)
      setTo('')
      setTokenAddress('')
      setAmount('')
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to send tokens'
      setError(errorMessage)
      console.error('Error sending tokens:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="send-tokens">
      <h3>Send Tokens</h3>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="recipientAddress">Recipient Address</label>
          <input
            id="recipientAddress"
            type="text"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="0x..."
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="tokenAddr">Token Address</label>
          <input
            id="tokenAddr"
            type="text"
            value={tokenAddress}
            onChange={(e) => setTokenAddress(e.target.value)}
            placeholder="0x..."
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="tokenAmount">Amount</label>
          <input
            id="tokenAmount"
            type="text"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.001"
            required
            disabled={loading}
          />
          <small>Amount in token units (e.g., 0.001, 1.5, 100)</small>
        </div>

        <button type="submit" disabled={loading} className="send-button">
          {loading ? 'Sending...' : 'Send Tokens'}
        </button>
      </form>

      {error && (
        <div className="error-message">
          <strong>Error:</strong> {error}
        </div>
      )}

      {success && (
        <div className="success-message">
          <h4>Tokens Sent Successfully!</h4>
          {success.txHash && (
            <p><strong>Transaction Hash:</strong> {success.txHash}</p>
          )}
        </div>
      )}
    </div>
  )
}

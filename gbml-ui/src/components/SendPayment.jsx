import { useState } from 'react'
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/gbml'

export default function SendPayment({ module }) {
  const [to, setTo] = useState('')
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)

  if (!module) {
    return null
  }

  const send = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await axios.post(`${API_BASE_URL}/payments/send`, {
        tokenAddress: module.tokenAddress,
        to,
        amount,
        moduleId: module.moduleId
      })

      setResult(response.data)
      alert('Payment sent successfully!')

      // Reset form
      setTo('')
      setAmount('')
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to send payment'
      setError(errorMessage)
      console.error('Error sending payment:', err)
      alert(`Error: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="send-payment">
      <h2>Send Payment</h2>
      <div className="module-info">
        <p><strong>Module:</strong> {module.tokenConfig?.name || 'Unnamed Token'}</p>
        <p><strong>Symbol:</strong> {module.tokenConfig?.symbol || 'N/A'}</p>
        <p><strong>Token Address:</strong> {module.tokenAddress}</p>
      </div>

      <form onSubmit={send}>
        <div className="form-group">
          <label htmlFor="to">Recipient Address:</label>
          <input
            id="to"
            type="text"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="0x..."
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="amount">Amount:</label>
          <input
            id="amount"
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
          {loading ? 'Sending...' : 'Send Payment'}
        </button>
      </form>

      {error && (
        <div className="error-message">
          <strong>Error:</strong> {error}
        </div>
      )}

      {result && (
        <div className="success-message">
          <h3>Payment Sent Successfully!</h3>
          <p><strong>Transaction Hash:</strong> {result.txHash}</p>
          <p><strong>Block Number:</strong> {result.blockNumber}</p>
          <p><strong>To:</strong> {result.to}</p>
          <p><strong>Amount:</strong> {result.amount}</p>
        </div>
      )}
    </div>
  )
}

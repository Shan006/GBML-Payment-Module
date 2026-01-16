import { useState } from 'react'
import axios from 'axios'

import { API_BASE_URL, TENANT_ID } from '../config'

export default function EnablePayments({ onEnabled }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [result, setResult] = useState(null)

  const enable = async () => {
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await axios.post(`${API_BASE_URL}/modules/payments/enable`, {
        tenantId: TENANT_ID,
        token: {
          mode: 'DEPLOY',
          name: 'Acme USD',
          symbol: 'aUSD',
          decimals: 18,
          initialSupply: '1000000000000000000000000', // 1M tokens with 18 decimals
          treasuryAddress: '0x0000000000000000000000000000000000000000' // Will be set by backend
        }
      })

      setResult(response.data)
      setSuccess(true)

      if (onEnabled) {
        onEnabled(response.data.moduleId, response.data.tokenAddress)
      }

      alert('Payments enabled successfully!')
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to enable payments'
      setError(errorMessage)
      console.error('Error enabling payments:', err)
      alert(`Error: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="enable-payments">
      <h2>Enable Blockchain Payments</h2>
      <p>Deploy a new JRC-20 token contract for payments</p>

      <button
        onClick={enable}
        disabled={loading}
        className="enable-button"
      >
        {loading ? 'Enabling...' : 'Enable Blockchain Payments'}
      </button>

      {error && (
        <div className="error-message">
          <strong>Error:</strong> {error}
        </div>
      )}

      {success && result && (
        <div className="success-message">
          <h3>Payments Enabled Successfully!</h3>
          <p><strong>Module ID:</strong> {result.moduleId}</p>
          <p><strong>Token Address:</strong> {result.tokenAddress}</p>
        </div>
      )}
    </div>
  )
}


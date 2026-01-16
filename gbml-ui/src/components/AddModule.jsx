import { useState } from 'react'
import axios from 'axios'
import { API_BASE_URL, TENANT_ID } from '../config'

export default function AddModule({ onModuleAdded }) {
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  // Token metadata form fields
  const [tokenName, setTokenName] = useState('')
  const [tokenSymbol, setTokenSymbol] = useState('')
  const [tokenDecimals, setTokenDecimals] = useState('18')
  const [initialSupply, setInitialSupply] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await axios.post(`${API_BASE_URL}/modules/payments/enable`, {
        tenantId: TENANT_ID,
        token: {
          mode: 'DEPLOY',
          name: tokenName,
          symbol: tokenSymbol,
          decimals: parseInt(tokenDecimals, 10),
          initialSupply: initialSupply,
        }
      })

      setSuccess(true)

      // Reset form
      setTokenName('')
      setTokenSymbol('')
      setTokenDecimals('18')
      setInitialSupply('')
      setShowForm(false)

      // Notify parent to refresh module list
      if (onModuleAdded) {
        onModuleAdded(response.data)
      }

      alert('Payment module created successfully!')
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to create module'
      setError(errorMessage)
      console.error('Error creating module:', err)
      alert(`Error: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  const handleSupplyChange = (e) => {
    const value = e.target.value
    setInitialSupply(value)
  }

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="add-module-button"
      >
        + Add Payment Module
      </button>
    )
  }

  return (
    <div className="add-module">
      <div className="add-module-header">
        <h2>Add New Payment Module</h2>
        <button
          onClick={() => {
            setShowForm(false)
            setError(null)
            setSuccess(false)
          }}
          className="close-button"
        >
          ×
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="tokenName">Token Name:</label>
          <input
            id="tokenName"
            type="text"
            value={tokenName}
            onChange={(e) => setTokenName(e.target.value)}
            placeholder="e.g., Acme USD"
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="tokenSymbol">Token Symbol:</label>
          <input
            id="tokenSymbol"
            type="text"
            value={tokenSymbol}
            onChange={(e) => setTokenSymbol(e.target.value.toUpperCase())}
            placeholder="e.g., AUSD"
            required
            disabled={loading}
            maxLength={10}
          />
        </div>

        <div className="form-group">
          <label htmlFor="tokenDecimals">Decimals:</label>
          <input
            id="tokenDecimals"
            type="number"
            value={tokenDecimals}
            onChange={(e) => setTokenDecimals(e.target.value)}
            placeholder="18"
            required
            disabled={loading}
            min="0"
            max="18"
          />
          <small>Number of decimal places (typically 18)</small>
        </div>

        <div className="form-group">
          <label htmlFor="initialSupply">Initial Supply:</label>
          <input
            id="initialSupply"
            type="text"
            value={initialSupply}
            onChange={handleSupplyChange}
            placeholder="e.g., 1000000"
            required
            disabled={loading}
          />
          <small>Initial token supply (in human-readable format, e.g., 1000000 for 1 million tokens)</small>
        </div>

        {error && (
          <div className="error-message">
            <strong>Error:</strong> {error}
          </div>
        )}

        {success && (
          <div className="success-message">
            Module created successfully!
          </div>
        )}

        <div className="form-actions">
          <button type="submit" disabled={loading} className="submit-button">
            {loading ? 'Creating...' : 'Create Module'}
          </button>
          <button
            type="button"
            onClick={() => {
              setShowForm(false)
              setError(null)
              setSuccess(false)
            }}
            disabled={loading}
            className="cancel-button"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

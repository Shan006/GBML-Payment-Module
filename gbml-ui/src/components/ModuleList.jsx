import { useState, useEffect } from 'react'
import axios from 'axios'
import EmergencyPauseButton from './EmergencyPauseButton'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/gbml'
const TENANT_ID = 'tenant-001' // In production, this would come from auth context

export default function ModuleList({ onSelectModule, selectedModuleId, refreshTrigger, role }) {
  const [modules, setModules] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const loadModules = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await axios.get(`${API_BASE_URL}/modules/payments`, {
        params: { tenantId: TENANT_ID }
      })
      setModules(response.data.modules || [])
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to load modules')
      console.error('Error loading modules:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadModules()
  }, [refreshTrigger])

  return (
    <div className="module-list">
      <div className="module-list-header">
        <h2>Payment Modules</h2>
        {/* <button onClick={loadModules} disabled={loading} className="refresh-button">
          {loading ? 'Loading...' : 'Refresh'}
        </button> */}
      </div>

      {error && (
        <div className="error-message">
          <strong>Error:</strong> {error}
        </div>
      )}

      {loading && modules.length === 0 ? (
        <p>Loading modules...</p>
      ) : modules.length === 0 ? (
        <p className="no-modules">No payment modules found. Create your first module!</p>
      ) : (
        <div className="modules-grid">
          {modules.map((module) => (
            <div
              key={module.moduleId}
              className={`module-card ${selectedModuleId === module.moduleId ? 'selected' : ''}`}
              onClick={() => onSelectModule(module)}
            >
              <div className="module-card-header">
                <h3>{module.tokenConfig?.name || 'Unnamed Token'}</h3>
                <div>
                  <span className="module-status">Active</span>
                </div>
              </div>
              <div className="module-card-body">
                <p><strong>Symbol:</strong> {module.tokenConfig?.symbol || 'N/A'}</p>
                {role === 'admin' && (
                  <div className="admin-actions" onClick={(e) => e.stopPropagation()} style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <EmergencyPauseButton scope="MODULE" targetId={module.moduleId} label="Module" />
                    <EmergencyPauseButton scope="TOKEN" targetId={module.tokenAddress} label="Token" />
                  </div>
                )}
                <p><strong>Decimals:</strong> {module.tokenConfig?.decimals || 'N/A'}</p>
                <p><strong>Token Address:</strong></p>
                <p className="token-address">{module.tokenAddress}</p>
                <p className="module-id"><strong>Module ID:</strong> {module.moduleId}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

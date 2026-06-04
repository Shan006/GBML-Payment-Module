/**
 * Enable Blockchain Form
 * Form to enable blockchain for a new module
 */

import { useState } from 'react';
import { enableBlockchain, MODULE_TYPES } from '../services/orchestrator.service';

function EnableBlockchain({ onSuccess }) {
  const [formData, setFormData] = useState({
    moduleId: '',
    moduleType: 'FUND'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.moduleId.trim()) {
      setError('Module ID is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const result = await enableBlockchain({
        moduleId: formData.moduleId.trim(),
        moduleType: formData.moduleType
      });

      setSuccess(result);
      
      // Reset form
      setFormData({
        moduleId: '',
        moduleType: 'FUND'
      });

      // Notify parent
      if (onSuccess) {
        setTimeout(() => onSuccess(result), 1500);
      }
    } catch (err) {
      console.error('Error enabling blockchain:', err);
      const details = err.response?.data?.details;
      const baseMessage = err.response?.data?.message || err.response?.data?.error || err.message;
      setError(
        Array.isArray(details) && details.length > 0
          ? `${baseMessage}: ${details.join(', ')}`
          : baseMessage || 'Failed to enable blockchain'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError(null);
    setSuccess(null);
  };

  const selectedType = MODULE_TYPES.find(t => t.value === formData.moduleType);

  return (
    <div style={{
      background: 'rgba(255,255,255,0.1)',
      padding: '2rem',
      borderRadius: '12px',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255,255,255,0.2)'
    }}>
      <h3 style={{ margin: '0 0 1.5rem 0', color: 'white', fontSize: '1.5rem' }}>
        🚀 Enable Blockchain for Module
      </h3>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{
            display: 'block',
            marginBottom: '0.5rem',
            color: 'white',
            fontWeight: 500
          }}>
            Module ID *
          </label>
          <input
            type="text"
            value={formData.moduleId}
            onChange={(e) => handleChange('moduleId', e.target.value)}
            placeholder="e.g., fund-001, treasury-main"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.2)',
              background: 'rgba(255,255,255,0.1)',
              color: 'white',
              fontSize: '1rem'
            }}
          />
          <small style={{ color: 'rgba(255,255,255,0.6)', marginTop: '0.25rem', display: 'block' }}>
            Unique identifier for this module
          </small>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{
            display: 'block',
            marginBottom: '0.5rem',
            color: 'white',
            fontWeight: 500
          }}>
            Module Type *
          </label>
          <select
            value={formData.moduleType}
            onChange={(e) => handleChange('moduleType', e.target.value)}
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.2)',
              background: 'rgba(255,255,255,0.1)',
              color: 'black',
              fontSize: '1rem'
            }}
          >
            {MODULE_TYPES.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          {selectedType && (
            <small style={{ color: 'rgba(255,255,255,0.6)', marginTop: '0.25rem', display: 'block' }}>
              {selectedType.description}
            </small>
          )}
        </div>

        {/* What will happen */}
        <div style={{
          background: 'rgba(102, 126, 234, 0.2)',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '1.5rem',
          border: '1px solid rgba(102, 126, 234, 0.3)'
        }}>
          <div style={{ color: 'white', fontWeight: 600, marginBottom: '0.5rem' }}>
            ✨ What will happen:
          </div>
          <ul style={{ margin: 0, paddingLeft: '1.5rem', color: 'rgba(255,255,255,0.8)' }}>
            <li>Deploy the correct Juvidoe contract template (JRC-20, JRC-721, Treasury, Router)</li>
            <li>Register contract in GBML registry and dashboard.json</li>
            <li>Create and bind a module wallet (treasury / owner)</li>
            <li>Enable JVD EGCR settlement routing</li>
            <li>Enforce KYC for blockchain interactions</li>
            <li>Write an audit trail entry</li>
            <li>Enable fiat conversion for Payment and Fund modules</li>
          </ul>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: 'rgba(255, 107, 107, 0.2)',
            border: '1px solid rgba(255, 107, 107, 0.5)',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            color: '#ff6b6b'
          }}>
            ❌ {error}
          </div>
        )}

        {/* Success */}
        {success && (
          <div style={{
            background: 'rgba(78, 205, 196, 0.2)',
            border: '1px solid rgba(78, 205, 196, 0.5)',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            color: '#4ecdc4'
          }}>
            <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>
              {success.alreadyEnabled
                ? 'ℹ️ Module already has blockchain enabled'
                : '✅ Blockchain enabled successfully!'}
            </div>
            <div style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
              <strong>Status:</strong> {success.status}
            </div>
            <div style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
              <strong>Contract Address:</strong><br />
              <code style={{ 
                background: 'rgba(0,0,0,0.2)', 
                padding: '0.25rem 0.5rem', 
                borderRadius: '4px',
                fontSize: '0.85rem',
                wordBreak: 'break-all'
              }}>
                {success.contractAddress}
              </code>
            </div>
            {success.walletAddress && (
              <div style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                <strong>Module Wallet:</strong><br />
                <code style={{ 
                  background: 'rgba(0,0,0,0.2)', 
                  padding: '0.25rem 0.5rem', 
                  borderRadius: '4px',
                  fontSize: '0.85rem',
                  wordBreak: 'break-all'
                }}>
                  {success.walletAddress}
                </code>
              </div>
            )}
            {success.jvdRouterAddress && (
              <div style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                <strong>JVD Router:</strong><br />
                <code style={{ 
                  background: 'rgba(0,0,0,0.2)', 
                  padding: '0.25rem 0.5rem', 
                  borderRadius: '4px',
                  fontSize: '0.85rem',
                  wordBreak: 'break-all'
                }}>
                  {success.jvdRouterAddress}
                </code>
              </div>
            )}
            {success.services && (
              <div style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                <strong>Services:</strong>{' '}
                Wallet {success.services.wallet ? '✓' : '✗'},{' '}
                Settlement {success.services.settlement ? '✓' : '✗'},{' '}
                Conversion {success.services.conversion ? '✓' : '✗'}
                {success.kycEnabled && ', KYC ✓'}
              </div>
            )}
            {success.deployment?.txHash && (
              <div style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                <strong>Transaction:</strong><br />
                <code style={{ 
                  background: 'rgba(0,0,0,0.2)', 
                  padding: '0.25rem 0.5rem', 
                  borderRadius: '4px',
                  fontSize: '0.85rem',
                  wordBreak: 'break-all'
                }}>
                  {success.deployment.txHash}
                </code>
              </div>
            )}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !formData.moduleId.trim()}
          style={{
            width: '100%',
            padding: '1rem',
            background: loading || !formData.moduleId.trim() 
              ? 'rgba(255,255,255,0.2)' 
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: loading || !formData.moduleId.trim() ? 'not-allowed' : 'pointer',
            fontSize: '1rem',
            fontWeight: 600,
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}
        >
          {loading ? '⏳ Enabling Blockchain...' : '🚀 Enable Blockchain'}
        </button>
      </form>

      <div style={{
        marginTop: '1.5rem',
        padding: '1rem',
        borderRadius: '8px',
        background: 'rgba(0,0,0,0.15)',
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600, marginBottom: '0.5rem' }}>
          💡 Tips
        </div>
        <ul style={{
          margin: 0,
          paddingLeft: '1.25rem',
          color: 'rgba(255,255,255,0.65)',
          fontSize: '0.9rem',
          lineHeight: 1.6
        }}>
          <li>Use a unique, descriptive module ID (e.g. <code style={{ color: 'rgba(255,255,255,0.8)' }}>fund-001</code>)</li>
          <li>Enablement typically takes 30–60 seconds while the contract deploys</li>
          <li>Constructor parameters are auto-generated unless you pass them via the API</li>
          <li>Payment modules automatically enable wallet, settlement, and fiat conversion</li>
        </ul>
      </div>
    </div>
  );
}

export default EnableBlockchain;
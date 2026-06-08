/**
 * Blockchain Module Card
 * Displays individual blockchain module information
 */

import { useState } from 'react';
import { updateServices, disableBlockchain, enableBlockchain, getModuleTypeInfo } from '../services/orchestrator.service';
import CopyableAddress from './ui/CopyableAddress';

function BlockchainModuleCard({ module, role, onUpdate }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const typeInfo = getModuleTypeInfo(module.moduleType);

  const handleToggleService = async (service, currentValue) => {
    if (role !== 'admin') return;

    try {
      setLoading(true);
      setError(null);

      await updateServices(module.moduleId, {
        [`${service}Enabled`]: !currentValue
      });

      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('Error updating service:', err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async () => {
    if (role !== 'admin') return;
    
    if (!confirm(`Are you sure you want to disable blockchain for ${module.moduleId}?`)) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await disableBlockchain(module.moduleId);

      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('Error disabling blockchain:', err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReEnable = async () => {
    if (role !== 'admin') return;
    
    if (!confirm(`Are you sure you want to re-enable blockchain for ${module.moduleId}?`)) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await enableBlockchain({
        moduleId: module.moduleId,
        moduleType: module.moduleType
      });

      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('Error re-enabling blockchain:', err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE': return '#4ecdc4';
      case 'INACTIVE': return '#ff6b6b';
      case 'PENDING': return '#f9ca24';
      case 'FAILED': return '#ff6b6b';
      default: return 'rgba(255,255,255,0.5)';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ACTIVE': return '✅';
      case 'INACTIVE': return '⏸️';
      case 'PENDING': return '⏳';
      case 'FAILED': return '❌';
      default: return '❓';
    }
  };

  return (
    <div style={{
      background: 'rgba(255,255,255,0.1)',
      borderRadius: '12px',
      padding: '1.5rem',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255,255,255,0.2)',
      transition: 'transform 0.2s, box-shadow 0.2s'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-4px)';
      e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.2)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = 'none';
    }}
    >
      {/* Header */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '0.5rem'
        }}>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: 0, color: 'white', fontSize: '1.2rem' }}>
              {module.moduleId}
            </h3>
            <div style={{
              display: 'inline-block',
              padding: '0.25rem 0.75rem',
              background: 'rgba(102, 126, 234, 0.3)',
              borderRadius: '12px',
              fontSize: '0.85rem',
              color: '#667eea',
              marginTop: '0.5rem'
            }}>
              {typeInfo.label}
            </div>
          </div>

          <button
            onClick={() => setShowDetails(!showDetails)}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '8px',
              padding: '0.5rem 0.75rem',
              color: 'rgba(255,255,255,0.7)',
              fontSize: '1rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
              marginLeft: '0.75rem'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.2)';
              e.target.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.1)';
              e.target.style.color = 'rgba(255,255,255,0.7)';
            }}
          >
            {showDetails ? '▲' : '▼'}
          </button>
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '0.5rem'
        }}>
          <div style={{
            fontSize: '0.85rem',
            color: getStatusColor(module.status),
            fontWeight: 600
          }}>
            {module.status}
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '1.2rem'
          }}>
            <span>{getStatusIcon(module.status)}</span>
          </div>
        </div>
      </div>

      {/* Contract Address */}
      <CopyableAddress 
        address={module.contractAddress}
        label="Contract Address"
        style={{ marginBottom: '1rem' }}
      />

      {/* Services */}
      {/* <div style={{ marginBottom: '1rem' }}>
        <div style={{
          fontSize: '0.85rem',
          color: 'rgba(255,255,255,0.7)',
          marginBottom: '0.5rem',
          fontWeight: 600
        }}>
          Services
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <ServiceBadge
            label="Wallet"
            enabled={module.services?.wallet}
            onClick={(e) => {
              e.stopPropagation();
              if (role === 'admin') handleToggleService('wallet', module.services?.wallet);
            }}
            disabled={loading || role !== 'admin'}
          />
          <ServiceBadge
            label="Settlement"
            enabled={module.services?.settlement}
            onClick={(e) => {
              e.stopPropagation();
              if (role === 'admin') handleToggleService('settlement', module.services?.settlement);
            }}
            disabled={loading || role !== 'admin'}
          />
          <ServiceBadge
            label="Conversion"
            enabled={module.services?.conversion}
            onClick={(e) => {
              e.stopPropagation();
              if (role === 'admin') handleToggleService('conversion', module.services?.conversion);
            }}
            disabled={loading || role !== 'admin'}
          />
        </div>
      </div> */}

      {/* Details (expandable) */}
      {showDetails && (
        <div style={{
          marginTop: '1rem',
          paddingTop: '1rem',
          borderTop: '1px solid rgba(255,255,255,0.1)'
        }}>
          {module.walletAddress && (
            <CopyableAddress 
              address={module.walletAddress}
              label="Module Wallet"
            />
          )}

          {module.jvdRouterAddress && (
            <CopyableAddress 
              address={module.jvdRouterAddress}
              label="JVD Router"
            />
          )}

          {module.deploymentTxHash && (
            <CopyableAddress 
              address={module.deploymentTxHash}
              label="Deployment Transaction"
            />
          )}

          {module.createdAt && (
            <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>
              Enabled: {new Date(module.createdAt).toLocaleString()}
            </div>
          )}

          {/* Admin Actions */}
          {role === 'admin' && (
            <>
              {module.enabled ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDisable();
                  }}
                  disabled={loading}
                  style={{
                    marginTop: '1rem',
                    width: '100%',
                    padding: '0.75rem',
                    background: 'rgba(255, 107, 107, 0.2)',
                    border: '1px solid rgba(255, 107, 107, 0.5)',
                    color: '#ff6b6b',
                    borderRadius: '8px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: 600
                  }}
                >
                  {loading ? '⏳ Disabling...' : '🛑 Disable Blockchain'}
                </button>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReEnable();
                  }}
                  disabled={loading}
                  style={{
                    marginTop: '1rem',
                    width: '100%',
                    padding: '0.75rem',
                    background: 'linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)',
                    border: 'none',
                    color: 'white',
                    borderRadius: '8px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    boxShadow: '0 4px 15px rgba(78, 205, 196, 0.4)'
                  }}
                >
                  {loading ? '⏳ Re-enabling...' : '✅ Re-enable Module'}
                </button>
              )}
            </>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{
          marginTop: '1rem',
          padding: '0.75rem',
          background: 'rgba(255, 107, 107, 0.2)',
          border: '1px solid rgba(255, 107, 107, 0.5)',
          borderRadius: '8px',
          fontSize: '0.85rem',
          color: '#ff6b6b'
        }}>
          {error}
        </div>
      )}
    </div>
  );
}

function ServiceBadge({ label, enabled, onClick, disabled }) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: '0.5rem 1rem',
        borderRadius: '20px',
        fontSize: '0.85rem',
        fontWeight: 600,
        background: enabled 
          ? 'rgba(78, 205, 196, 0.2)' 
          : 'rgba(255,255,255,0.1)',
        color: enabled ? '#4ecdc4' : 'rgba(255,255,255,0.5)',
        border: `1px solid ${enabled ? 'rgba(78, 205, 196, 0.5)' : 'rgba(255,255,255,0.2)'}`,
        cursor: disabled ? 'default' : 'pointer',
        transition: 'all 0.2s',
        userSelect: 'none'
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.transform = 'scale(1.05)';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
      }}
    >
      {enabled ? '✓' : '✗'} {label}
    </div>
  );
}

export default BlockchainModuleCard;

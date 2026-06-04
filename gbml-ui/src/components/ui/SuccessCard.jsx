import { useState } from 'react';
import CopyableAddress from './CopyableAddress';

/**
 * SuccessCard - Premium success display with expandable technical details
 * Features: Expandable details, copyable addresses, block explorer links
 */
function SuccessCard({ success }) {
  const [expanded, setExpanded] = useState(false);

  const services = [
    { key: 'wallet', label: 'Wallet', icon: '👛', enabled: success.services?.wallet },
    { key: 'settlement', label: 'Settlement', icon: '🔄', enabled: success.services?.settlement },
    { key: 'conversion', label: 'Conversion', icon: '💱', enabled: success.services?.conversion },
    { key: 'kyc', label: 'KYC', icon: '🔐', enabled: success.kycEnabled }
  ];

  return (
    <div style={{
      background: 'rgba(78, 205, 196, 0.1)',
      border: '1px solid rgba(78, 205, 196, 0.4)',
      padding: '1.5rem',
      borderRadius: '12px',
      marginBottom: '1.5rem',
      animation: 'fadeIn 0.5s ease'
    }}>
      {/* Success Header */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '1rem',
        marginBottom: '1.25rem'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.5rem',
          flexShrink: 0
        }}>
          {success.alreadyEnabled ? 'ℹ️' : '✅'}
        </div>
        
        <div style={{ flex: 1 }}>
          <div style={{ 
            color: '#4ecdc4', 
            fontWeight: 700, 
            fontSize: '1.1rem',
            marginBottom: '0.25rem'
          }}>
            {success.alreadyEnabled 
              ? 'Module Already Enabled' 
              : 'Blockchain Enabled Successfully!'}
          </div>
          <div style={{ 
            color: 'rgba(255,255,255,0.7)', 
            fontSize: '0.85rem'
          }}>
            Status: {success.status}
          </div>
        </div>
      </div>

      {/* Service Indicators */}
      <div style={{
        display: 'flex',
        gap: '0.75rem',
        marginBottom: '1.25rem',
        flexWrap: 'wrap'
      }}>
        {services.map(service => (
          <div
            key={service.key}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.5rem 0.75rem',
              borderRadius: '20px',
              background: service.enabled 
                ? 'rgba(78, 205, 196, 0.2)' 
                : 'rgba(255, 255, 255, 0.05)',
              border: service.enabled 
                ? '1px solid rgba(78, 205, 196, 0.4)' 
                : '1px solid rgba(255, 255, 255, 0.1)',
              fontSize: '0.8rem',
              color: service.enabled ? '#4ecdc4' : 'rgba(255,255,255,0.4)',
              fontWeight: 500
            }}
          >
            <span>{service.icon}</span>
            <span>{service.label}</span>
            <span>{service.enabled ? '✓' : '○'}</span>
          </div>
        ))}
      </div>

      {/* Expandable Technical Details */}
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          width: '100%',
          padding: '0.75rem',
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '8px',
          color: 'rgba(255,255,255,0.9)',
          fontSize: '0.85rem',
          fontWeight: 500,
          cursor: 'pointer',
          transition: 'all 0.2s',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          marginBottom: expanded ? '1rem' : 0
        }}
        onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.1)'}
        onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.05)'}
      >
        <span>{expanded ? '▼' : '▶'}</span>
        <span>{expanded ? 'Hide Technical Details' : 'Show Technical Details'}</span>
      </button>

      {/* Technical Details Content */}
      {expanded && (
        <div style={{
          background: 'rgba(0, 0, 0, 0.2)',
          padding: '1.25rem',
          borderRadius: '8px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          animation: 'slideDown 0.3s ease'
        }}>
          <CopyableAddress 
            address={success.contractAddress} 
            label="Contract Address"
          />
          
          {success.walletAddress && (
            <CopyableAddress 
              address={success.walletAddress} 
              label="Module Wallet"
            />
          )}
          
          {success.jvdRouterAddress && (
            <CopyableAddress 
              address={success.jvdRouterAddress} 
              label="JVD EGCR Router"
            />
          )}
          
          {success.deployment?.txHash && (
            <CopyableAddress 
              address={success.deployment.txHash} 
              label="Transaction Hash"
            />
          )}

          {success.moduleId && (
            <div style={{ marginTop: '0.75rem' }}>
              <div style={{ 
                color: 'rgba(255,255,255,0.7)', 
                fontSize: '0.85rem',
                fontWeight: 500,
                marginBottom: '0.25rem'
              }}>
                Module ID
              </div>
              <code style={{ 
                background: 'rgba(0,0,0,0.3)', 
                padding: '0.5rem 0.75rem', 
                borderRadius: '6px',
                fontSize: '0.85rem',
                color: 'rgba(255,255,255,0.9)',
                fontFamily: 'monospace'
              }}>
                {success.moduleId}
              </code>
            </div>
          )}

          {success.moduleType && (
            <div style={{ marginTop: '0.75rem' }}>
              <div style={{ 
                color: 'rgba(255,255,255,0.7)', 
                fontSize: '0.85rem',
                fontWeight: 500,
                marginBottom: '0.25rem'
              }}>
                Module Type
              </div>
              <code style={{ 
                background: 'rgba(0,0,0,0.3)', 
                padding: '0.5rem 0.75rem', 
                borderRadius: '6px',
                fontSize: '0.85rem',
                color: 'rgba(255,255,255,0.9)',
                fontFamily: 'monospace'
              }}>
                {success.moduleType}
              </code>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default SuccessCard;

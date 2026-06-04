import { useState } from 'react';

/**
 * CopyableAddress - Reusable component for addresses/hashes
 * Features: Copy-to-clipboard, block explorer link, truncated display
 */
function CopyableAddress({ 
  address, 
  label, 
  explorerUrl = null, 
  showFull = false,
  style = {} 
}) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const truncateAddress = (addr) => {
    if (showFull || expanded || addr.length < 42) return addr;
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const isTxHash = address.length === 66 && address.startsWith('0x');
  const defaultExplorer = isTxHash 
    ? `https://juvidoe-explorer.io/tx/${address}`
    : `https://juvidoe-explorer.io/address/${address}`;
  const finalExplorerUrl = explorerUrl || defaultExplorer;

  return (
    <div style={{ marginBottom: '0.75rem', ...style }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: '0.25rem'
      }}>
        <span style={{ 
          color: 'rgba(255,255,255,0.7)', 
          fontSize: '0.85rem',
          fontWeight: 500 
        }}>
          {label}
        </span>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setExpanded(!expanded)}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '4px',
              padding: '0.25rem 0.5rem',
              color: 'rgba(255,255,255,0.6)',
              fontSize: '0.7rem',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
            onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
          >
            {expanded ? 'Collapse' : 'Expand'}
          </button>
          <button
            onClick={handleCopy}
            style={{
              background: copied ? 'rgba(78, 205, 196, 0.3)' : 'rgba(255,255,255,0.1)',
              border: copied ? '1px solid rgba(78, 205, 196, 0.5)' : '1px solid rgba(255,255,255,0.2)',
              borderRadius: '4px',
              padding: '0.25rem 0.5rem',
              color: copied ? '#4ecdc4' : 'rgba(255,255,255,0.6)',
              fontSize: '0.7rem',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.background = copied ? 'rgba(78, 205, 196, 0.4)' : 'rgba(255,255,255,0.2)'}
            onMouseLeave={(e) => e.target.style.background = copied ? 'rgba(78, 205, 196, 0.3)' : 'rgba(255,255,255,0.1)'}
          >
            {copied ? '✓ Copied' : '📋 Copy'}
          </button>
        </div>
      </div>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        <code style={{ 
          background: 'rgba(0,0,0,0.3)', 
          padding: '0.5rem 0.75rem', 
          borderRadius: '6px',
          fontSize: '0.85rem',
          wordBreak: 'break-all',
          fontFamily: 'monospace',
          color: 'rgba(255,255,255,0.9)',
          flex: 1
        }}>
          {truncateAddress(address)}
        </code>
        <a
          href={finalExplorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            background: 'rgba(102, 126, 234, 0.2)',
            border: '1px solid rgba(102, 126, 234, 0.4)',
            borderRadius: '6px',
            padding: '0.5rem',
            color: '#667eea',
            fontSize: '0.85rem',
            cursor: 'pointer',
            textDecoration: 'none',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: '36px'
          }}
          onMouseEnter={(e) => e.target.style.background = 'rgba(102, 126, 234, 0.3)'}
          onMouseLeave={(e) => e.target.style.background = 'rgba(102, 126, 234, 0.2)'}
          title="View on Block Explorer"
        >
          🔗
        </a>
      </div>
    </div>
  );
}

export default CopyableAddress;

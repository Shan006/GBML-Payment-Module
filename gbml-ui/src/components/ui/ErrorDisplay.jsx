/**
 * ErrorDisplay - Categorized error display with actionable messages
 * Categorizes errors and provides troubleshooting hints
 */
function ErrorDisplay({ error, onRetry }) {
  const categorizeError = (errorMessage) => {
    const lowerError = errorMessage.toLowerCase();
    
    if (lowerError.includes('user rejected') || lowerError.includes('user denied')) {
      return {
        category: 'User Rejected',
        icon: '🚫',
        color: '#ff6b6b',
        hint: 'Transaction was rejected in your wallet. Please try again and confirm the transaction.',
        canRetry: true
      };
    }
    
    if (lowerError.includes('gas') || lowerError.includes('insufficient funds')) {
      return {
        category: 'Gas / Insufficient Funds',
        icon: '⛽',
        color: '#feca57',
        hint: 'Insufficient gas or funds. Please ensure your wallet has enough balance for gas fees.',
        canRetry: false
      };
    }
    
    if (lowerError.includes('timeout') || lowerError.includes('network') || lowerError.includes('connection')) {
      return {
        category: 'Network Timeout',
        icon: '🌐',
        color: '#ff9f43',
        hint: 'Network connection issue. Please check your internet connection and try again.',
        canRetry: true
      };
    }
    
    if (lowerError.includes('validation') || lowerError.includes('required') || lowerError.includes('invalid')) {
      return {
        category: 'Validation Error',
        icon: '⚠️',
        color: '#feca57',
        hint: 'Please check your input and ensure all required fields are filled correctly.',
        canRetry: false
      };
    }
    
    if (lowerError.includes('deployment') || lowerError.includes('contract')) {
      return {
        category: 'Contract Deployment Failed',
        icon: '📜',
        color: '#ff6b6b',
        hint: 'Smart contract deployment failed. This could be due to network congestion or gas issues.',
        canRetry: true
      };
    }
    
    // Default category
    return {
      category: 'Unknown Error',
      icon: '❌',
      color: '#ff6b6b',
      hint: 'An unexpected error occurred. Please try again or contact support if the issue persists.',
      canRetry: true
    };
  };

  const errorInfo = categorizeError(error);

  return (
    <div style={{
      background: 'rgba(255, 107, 107, 0.1)',
      border: '1px solid rgba(255, 107, 107, 0.4)',
      padding: '1.25rem',
      borderRadius: '12px',
      marginBottom: '1.5rem',
      animation: 'fadeIn 0.3s ease'
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'flex-start', 
        gap: '1rem',
        marginBottom: '1rem'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '8px',
          background: 'rgba(255, 107, 107, 0.2)',
          border: '1px solid rgba(255, 107, 107, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.25rem',
          flexShrink: 0
        }}>
          {errorInfo.icon}
        </div>
        
        <div style={{ flex: 1 }}>
          <div style={{ 
            color: errorInfo.color, 
            fontWeight: 600, 
            fontSize: '0.95rem',
            marginBottom: '0.5rem'
          }}>
            {errorInfo.category}
          </div>
          <div style={{ 
            color: 'rgba(255,255,255,0.8)', 
            fontSize: '0.85rem',
            lineHeight: 1.5
          }}>
            {error}
          </div>
        </div>
      </div>

      {/* Troubleshooting Hint */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        padding: '0.75rem 1rem',
        borderRadius: '8px',
        marginBottom: '1rem',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem',
          marginBottom: '0.25rem'
        }}>
          <span style={{ fontSize: '0.9rem' }}>💡</span>
          <span style={{ 
            color: 'rgba(255,255,255,0.9)', 
            fontWeight: 500, 
            fontSize: '0.85rem'
          }}>
            Troubleshooting
          </span>
        </div>
        <div style={{ 
          color: 'rgba(255,255,255,0.7)', 
          fontSize: '0.8rem',
          lineHeight: 1.5,
          paddingLeft: '1.5rem'
        }}>
          {errorInfo.hint}
        </div>
      </div>

      {/* Retry Button */}
      {errorInfo.canRetry && onRetry && (
        <button
          onClick={onRetry}
          style={{
            width: '100%',
            padding: '0.75rem',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: 600,
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}
          onMouseEnter={(e) => e.target.style.transform = 'translateY(-1px)'}
          onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
        >
          <span>🔄</span>
          <span>Retry Enablement</span>
        </button>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default ErrorDisplay;

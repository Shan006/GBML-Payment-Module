/**
 * ServiceStepIndicator - Shows which services will be enabled for a module
 * Displays as a sleek step-by-step wizard with icons
 */
function ServiceStepIndicator({ moduleType }) {
  const services = [
    {
      key: 'wallet',
      label: 'Module Wallet',
      icon: '👛',
      description: 'Treasury/owner wallet for contract',
      enabled: true
    },
    {
      key: 'settlement',
      label: 'JVD EGCR Settlement',
      icon: '🔄',
      description: 'Mandatory routing through settlement layer',
      enabled: ['PAYMENT', 'FUND', 'TREASURY', 'GRANT', 'REGISTRY'].includes(moduleType)
    },
    {
      key: 'conversion',
      label: 'Fiat Conversion',
      icon: '💱',
      description: 'USD/EUR to token conversion',
      enabled: ['PAYMENT', 'FUND'].includes(moduleType)
    },
    {
      key: 'kyc',
      label: 'KYC Enforcement',
      icon: '🔐',
      description: 'Identity verification for interactions',
      enabled: true
    }
  ];

  return (
    <div style={{
      background: 'rgba(102, 126, 234, 0.15)',
      padding: '1.25rem',
      borderRadius: '12px',
      marginBottom: '1.5rem',
      border: '1px solid rgba(102, 126, 234, 0.3)'
    }}>
      <div style={{ 
        color: 'white', 
        fontWeight: 600, 
        marginBottom: '1rem',
        fontSize: '0.95rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        <span>✨</span>
        <span>Services to Enable</span>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {services.map((service, index) => (
          <div
            key={service.key}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '0.75rem',
              borderRadius: '8px',
              background: service.enabled 
                ? 'rgba(78, 205, 196, 0.1)' 
                : 'rgba(255, 255, 255, 0.05)',
              border: service.enabled 
                ? '1px solid rgba(78, 205, 196, 0.3)' 
                : '1px solid rgba(255, 255, 255, 0.1)',
              transition: 'all 0.3s ease',
              opacity: service.enabled ? 1 : 0.5
            }}
          >
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: service.enabled 
                ? 'rgba(78, 205, 196, 0.2)' 
                : 'rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.1rem'
            }}>
              {service.icon}
            </div>
            
            <div style={{ flex: 1 }}>
              <div style={{ 
                color: 'white', 
                fontWeight: 500, 
                fontSize: '0.9rem',
                marginBottom: '0.15rem'
              }}>
                {service.label}
              </div>
              <div style={{ 
                color: 'rgba(255,255,255,0.6)', 
                fontSize: '0.8rem'
              }}>
                {service.description}
              </div>
            </div>
            
            <div style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: service.enabled 
                ? 'rgba(78, 205, 196, 0.3)' 
                : 'rgba(255, 255, 255, 0.1)',
              border: service.enabled 
                ? '1px solid rgba(78, 205, 196, 0.5)' 
                : '1px solid rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.75rem',
              color: service.enabled ? '#4ecdc4' : 'rgba(255,255,255,0.4)'
            }}>
              {service.enabled ? '✓' : '○'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ServiceStepIndicator;

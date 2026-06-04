/**
 * ProgressStepper - Granular progress indicator for enablement process
 * Shows exact stages with animated progress bar
 */
function ProgressStepper({ currentStep, totalSteps = 5 }) {
  const steps = [
    { key: 'router', label: 'Deploying JvdEgcrRouter', icon: '🔀' },
    { key: 'wallet', label: 'Creating Module Wallet', icon: '👛' },
    { key: 'contract', label: 'Deploying Smart Contract', icon: '📜' },
    { key: 'registry', label: 'Registering in GBML', icon: '📋' },
    { key: 'services', label: 'Enabling Platform Services', icon: '⚙️' }
  ];

  const progress = ((currentStep) / totalSteps) * 100;

  return (
    <div style={{
      background: 'rgba(102, 126, 234, 0.1)',
      padding: '1.25rem',
      borderRadius: '12px',
      marginBottom: '1.5rem',
      border: '1px solid rgba(102, 126, 234, 0.25)'
    }}>
      <div style={{ 
        color: 'white', 
        fontWeight: 600, 
        marginBottom: '1rem',
        fontSize: '0.95rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>⚡</span>
          <span>Enablement Progress</span>
        </span>
        <span style={{ 
          color: 'rgba(255,255,255,0.7)', 
          fontSize: '0.85rem',
          fontWeight: 400
        }}>
          Step {currentStep}/{totalSteps}
        </span>
      </div>

      {/* Progress Bar */}
      <div style={{
        height: '8px',
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '4px',
        marginBottom: '1.25rem',
        overflow: 'hidden',
        position: 'relative'
      }}>
        <div style={{
          height: '100%',
          width: `${progress}%`,
          background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '4px',
          transition: 'width 0.5s ease',
          position: 'relative'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
            animation: 'shimmer 1.5s infinite'
          }} />
        </div>
      </div>

      {/* Step Indicators */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;
          const isPending = stepNumber > currentStep;

          return (
            <div
              key={step.key}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '0.75rem',
                borderRadius: '8px',
                background: isActive 
                  ? 'rgba(102, 126, 234, 0.2)' 
                  : isCompleted 
                    ? 'rgba(78, 205, 196, 0.1)' 
                    : 'rgba(255, 255, 255, 0.05)',
                border: isActive 
                  ? '1px solid rgba(102, 126, 234, 0.4)' 
                  : isCompleted 
                    ? '1px solid rgba(78, 205, 196, 0.3)' 
                    : '1px solid rgba(255, 255, 255, 0.1)',
                transition: 'all 0.3s ease',
                opacity: isPending ? 0.5 : 1
              }}
            >
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: isActive 
                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                  : isCompleted 
                    ? 'rgba(78, 205, 196, 0.3)' 
                    : 'rgba(255, 255, 255, 0.1)',
                border: isActive 
                  ? '1px solid rgba(102, 126, 234, 0.5)' 
                  : isCompleted 
                    ? '1px solid rgba(78, 205, 196, 0.4)' 
                    : '1px solid rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1rem',
                color: isActive ? 'white' : isCompleted ? '#4ecdc4' : 'rgba(255,255,255,0.4)',
                fontWeight: isActive ? 600 : 400
              }}>
                {isCompleted ? '✓' : step.icon}
              </div>
              
              <div style={{ flex: 1 }}>
                <div style={{ 
                  color: 'white', 
                  fontWeight: isActive ? 600 : 500, 
                  fontSize: '0.9rem',
                  marginBottom: '0.15rem'
                }}>
                  {step.label}
                </div>
                <div style={{ 
                  color: 'rgba(255,255,255,0.5)', 
                  fontSize: '0.75rem'
                }}>
                  {isActive && 'Processing...'}
                  {isCompleted && 'Completed'}
                  {isPending && 'Pending'}
                </div>
              </div>

              {isActive && (
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  border: '2px solid rgba(102, 126, 234, 0.5)',
                  borderTop: '2px solid #667eea',
                  animation: 'spin 1s linear infinite'
                }} />
              )}
            </div>
          );
        })}
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default ProgressStepper;

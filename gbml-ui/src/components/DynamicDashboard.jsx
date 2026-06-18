/**
 * Dynamic Dashboard Shell Component
 * Generic/polymorphic dashboard that adapts to module capabilities
 * Renders appropriate visualization elements based on module features
 */

import { useState, useEffect } from 'react';
import { useModule } from '../hooks/useDynamicModules';
import { useModuleFeatureFlags } from '../hooks/useDynamicModules';
import TokenBalances from './TokenBalances';
import TransactionHistory from './TransactionHistory';
import JobBoardDashboard from './JobBoardDashboard';

function DynamicDashboard({ moduleId, role }) {
  const { module, loading, error } = useModule(moduleId);
  const { isFeatureEnabled } = useModuleFeatureFlags();
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  useEffect(() => {
    if (module) {
      fetchModuleAnalytics();
    }
  }, [module]);

  const fetchModuleAnalytics = async () => {
    try {
      setAnalyticsLoading(true);
      // In a real implementation, this would call an analytics endpoint
      // For now, we'll use mock data based on module capabilities
      const mockAnalytics = {
        totalTransactions: Math.floor(Math.random() * 1000) + 100,
        totalVolume: (Math.random() * 1000000).toFixed(2),
        activeUsers: Math.floor(Math.random() * 100) + 10,
        lastActivity: new Date().toISOString(),
        contractsDeployed: module.contractsDeployed || [],
        capabilities: module.capabilities || {}
      };
      setAnalytics(mockAnalytics);
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'white' }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
        <div>Loading module dashboard...</div>
      </div>
    );
  }

  if (error || !module) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#ff6b6b' }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>❌</div>
        <div>{error || 'Module not found'}</div>
      </div>
    );
  }

  const capabilities = module.capabilities || {};
  const uiProperties = module.uiProperties || {};
  const icon = uiProperties.icon || '📦';
  const primaryColor = uiProperties.primaryColor || '#667eea';

  return (
    <div className="dynamic-dashboard" style={{
      padding: '2rem',
      maxWidth: '1400px',
      margin: '0 auto'
    }}>
      {/* Module Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        paddingBottom: '1.5rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            fontSize: '3rem',
            background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}99 100%)`,
            width: '80px',
            height: '80px',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {icon}
          </div>
          <div>
            <h1 style={{ 
              margin: 0, 
              fontSize: '2rem', 
              color: 'white',
              fontWeight: 700
            }}>
              {module.moduleName}
            </h1>
            <div style={{ 
              display: 'flex', 
              gap: '0.5rem', 
              marginTop: '0.5rem',
              alignItems: 'center'
            }}>
              <span style={{
                padding: '0.25rem 0.75rem',
                borderRadius: '4px',
                background: module.isCustom ? 'rgba(102, 126, 234, 0.3)' : 'rgba(78, 205, 196, 0.3)',
                color: module.isCustom ? '#667eea' : '#4ecdc4',
                fontSize: '0.75rem',
                fontWeight: 600
              }}>
                {module.moduleType}
              </span>
              <span style={{
                padding: '0.25rem 0.75rem',
                borderRadius: '4px',
                background: module.enabled ? 'rgba(78, 205, 196, 0.3)' : 'rgba(255, 107, 107, 0.3)',
                color: module.enabled ? '#4ecdc4' : '#ff6b6b',
                fontSize: '0.75rem',
                fontWeight: 600
              }}>
                {module.enabled ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <FeatureFlagToggle moduleId={moduleId} />
        </div>
      </div>

      {/* Description */}
      {module.description && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          padding: '1.5rem',
          borderRadius: '12px',
          marginBottom: '2rem',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <p style={{ margin: 0, color: 'rgba(255, 255, 255, 0.8)', lineHeight: 1.6 }}>
            {module.description}
          </p>
        </div>
      )}

      {/* Analytics Cards */}
      {!analyticsLoading && analytics && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          <AnalyticsCard
            title="Total Transactions"
            value={analytics.totalTransactions}
            icon="📊"
            color="#667eea"
          />
          <AnalyticsCard
            title="Total Volume"
            value={analytics.totalVolume}
            icon="💰"
            color="#4ecdc4"
          />
          <AnalyticsCard
            title="Active Users"
            value={analytics.activeUsers}
            icon="👥"
            color="#f093fb"
          />
          <AnalyticsCard
            title="Contracts Deployed"
            value={analytics.contractsDeployed.length}
            icon="🔗"
            color="#fee140"
          />
        </div>
      )}

      {/* Dynamic Widgets based on capabilities */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {/* Token Balance Widget */}
        {capabilities.hasToken && isFeatureEnabled(moduleId, 'transactions') && (
          <WidgetContainer title="Token Balances" icon="🪙">
            <TokenBalances module={module} />
          </WidgetContainer>
        )}

        {/* Transaction History Widget */}
        {isFeatureEnabled(moduleId, 'transactions') && (
          <WidgetContainer title="Transaction History" icon="📜">
            <TransactionHistory module={module} />
          </WidgetContainer>
        )}

        {/* NFT Collection Widget */}
        {capabilities.hasNFT && isFeatureEnabled(moduleId, 'nft') && (
          <WidgetContainer title="NFT Collection" icon="🖼️">
            <div style={{ padding: '1rem', color: 'rgba(255, 255, 255, 0.7)' }}>
              <p>NFT collection management coming soon...</p>
            </div>
          </WidgetContainer>
        )}

        {/* Governance Widget */}
        {capabilities.hasGovernance && isFeatureEnabled(moduleId, 'governance') && (
          <WidgetContainer title="Governance" icon="🗳️">
            <div style={{ padding: '1rem', color: 'rgba(255, 255, 255, 0.7)' }}>
              <p>DAO governance interface coming soon...</p>
            </div>
          </WidgetContainer>
        )}

        {/* Job Board Widget */}
        {capabilities.hasJobEscrow && isFeatureEnabled(moduleId, 'transactions') && (
          <JobBoardDashboard moduleId={moduleId} />
        )}

        {/* Compliance Widget */}
        {capabilities.hasCompliance && isFeatureEnabled(moduleId, 'compliance') && (
          <WidgetContainer title="Compliance Status" icon="🛡️">
            <ComplianceStatus module={module} />
          </WidgetContainer>
        )}
      </div>

      {/* Deployed Contracts */}
      {module.contractsDeployed && module.contractsDeployed.length > 0 && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '12px',
          padding: '1.5rem',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <h3 style={{ margin: '0 0 1rem 0', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            🔗 Deployed Contracts
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {module.contractsDeployed.map((contract, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '1rem',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '8px'
                }}
              >
                <div>
                  <div style={{ color: 'white', fontWeight: 500 }}>
                    {contract.contractName}
                  </div>
                  <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.85rem' }}>
                    {contract.contractType}
                  </div>
                </div>
                <div style={{ 
                  padding: '0.5rem 1rem',
                  background: 'rgba(78, 205, 196, 0.2)',
                  borderRadius: '6px',
                  color: '#4ecdc4',
                  fontSize: '0.85rem',
                  fontFamily: 'monospace'
                }}>
                  {contract.contractAddress?.slice(0, 8)}...{contract.contractAddress?.slice(-6)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Service Bindings */}
      {module.services && (
        <div style={{
          marginTop: '2rem',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '12px',
          padding: '1.5rem',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <h3 style={{ margin: '0 0 1rem 0', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            ⚙️ Service Bindings
          </h3>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {Object.entries(module.services).map(([service, enabled]) => (
              <div
                key={service}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  background: enabled ? 'rgba(78, 205, 196, 0.2)' : 'rgba(255, 107, 107, 0.2)',
                  color: enabled ? '#4ecdc4' : '#ff6b6b',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                {enabled ? '✓' : '✗'} {service}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Analytics Card Component
 */
function AnalyticsCard({ title, value, icon, color }) {
  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.05)',
      padding: '1.5rem',
      borderRadius: '12px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '2rem' }}>{icon}</div>
        <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem' }}>
          {title}
        </div>
      </div>
      <div style={{ 
        fontSize: '2.5rem', 
        fontWeight: 700, 
        color: color 
      }}>
        {value}
      </div>
    </div>
  );
}

/**
 * Widget Container Component
 */
function WidgetContainer({ title, icon, children }) {
  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '12px',
      padding: '1.5rem',
      border: '1px solid rgba(255, 255, 255, 0.1)'
    }}>
      <h3 style={{ 
        margin: '0 0 1rem 0', 
        color: 'white', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '0.5rem',
        fontSize: '1.2rem'
      }}>
        {icon} {title}
      </h3>
      {children}
    </div>
  );
}

/**
 * Compliance Status Component
 */
function ComplianceStatus({ module }) {
  const compliance = module.compliance || {};

  return (
    <div style={{ padding: '1rem' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {compliance.kycRequired !== undefined && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'rgba(255, 255, 255, 0.8)' }}>KYC Required</span>
            <span style={{
              padding: '0.25rem 0.75rem',
              borderRadius: '4px',
              background: compliance.kycRequired ? 'rgba(78, 205, 196, 0.3)' : 'rgba(255, 107, 107, 0.3)',
              color: compliance.kycRequired ? '#4ecdc4' : '#ff6b6b',
              fontSize: '0.85rem',
              fontWeight: 600
            }}>
              {compliance.kycRequired ? 'Yes' : 'No'}
            </span>
          </div>
        )}
        {compliance.amlRequired !== undefined && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'rgba(255, 255, 255, 0.8)' }}>AML Required</span>
            <span style={{
              padding: '0.25rem 0.75rem',
              borderRadius: '4px',
              background: compliance.amlRequired ? 'rgba(78, 205, 196, 0.3)' : 'rgba(255, 107, 107, 0.3)',
              color: compliance.amlRequired ? '#4ecdc4' : '#ff6b6b',
              fontSize: '0.85rem',
              fontWeight: 600
            }}>
              {compliance.amlRequired ? 'Yes' : 'No'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Feature Flag Toggle Component
 */
function FeatureFlagToggle({ moduleId }) {
  const { toggleFeatureFlag, isFeatureEnabled } = useModuleFeatureFlags();
  const enabled = isFeatureEnabled(moduleId, 'enabled');

  return (
    <button
      onClick={() => toggleFeatureFlag(moduleId, 'enabled')}
      style={{
        padding: '0.75rem 1.5rem',
        background: enabled ? 'rgba(255, 107, 107, 0.2)' : 'rgba(78, 205, 196, 0.2)',
        color: enabled ? '#ff6b6b' : '#4ecdc4',
        border: enabled ? '1px solid rgba(255, 107, 107, 0.5)' : '1px solid rgba(78, 205, 196, 0.5)',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '0.9rem',
        fontWeight: 600,
        transition: 'all 0.2s'
      }}
    >
      {enabled ? '🔴 Disable Module' : '🟢 Enable Module'}
    </button>
  );
}

export default DynamicDashboard;

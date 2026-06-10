/**
 * Dynamic Navigation Component
 * Renders navigation items dynamically based on active modules
 * Supports both predefined and custom modules
 */

import { useState, useEffect } from 'react';
import { useDynamicModules } from '../hooks/useDynamicModules';
import { useModuleFeatureFlags } from '../hooks/useDynamicModules';

function DynamicNavigation({ onModuleSelect, selectedModuleId, role }) {
  const { navigationItems, loading, error } = useDynamicModules();
  const { isFeatureEnabled } = useModuleFeatureFlags();
  const [expandedSections, setExpandedSections] = useState({});

  // Default expanded sections
  useEffect(() => {
    setExpandedSections({
      standard: true,
      blockchain: true,
      custom: true
    });
  }, []);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleModuleClick = (module) => {
    // Check if module is feature-flagged and enabled
    if (!isFeatureEnabled(module.moduleId, 'enabled')) {
      return;
    }
    if (onModuleSelect) {
      onModuleSelect(module);
    }
  };

  // Filter navigation items based on feature flags
  const filteredNavigationItems = navigationItems.filter(item => {
    return isFeatureEnabled(item.moduleId, 'enabled');
  });

  // Separate predefined and custom modules
  const predefinedModules = filteredNavigationItems.filter(item => !item.isCustom);
  const customModules = filteredNavigationItems.filter(item => item.isCustom);

  if (loading) {
    return (
      <div style={{ padding: '1rem', color: 'rgba(255, 255, 255, 0.7)' }}>
        Loading modules...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '1rem', color: '#ff6b6b' }}>
        Error loading modules: {error}
      </div>
    );
  }

  return (
    <div className="dynamic-navigation" style={{
      background: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '12px',
      padding: '1rem',
      border: '1px solid rgba(255, 255, 255, 0.1)'
    }}>
      {/* Standard Navigation Items */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div
          onClick={() => toggleSection('standard')}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0.75rem',
            cursor: 'pointer',
            color: 'white',
            fontWeight: 600,
            fontSize: '0.9rem',
            borderRadius: '8px',
            transition: 'background 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.1)'}
          onMouseLeave={(e) => e.target.style.background = 'transparent'}
        >
          <span>📋 Standard</span>
          <span style={{ fontSize: '0.8rem' }}>
            {expandedSections.standard ? '▼' : '▶'}
          </span>
        </div>

        {expandedSections.standard && (
          <div style={{ marginTop: '0.5rem', paddingLeft: '0.5rem' }}>
            <NavItem
              icon="💳"
              label="Token Transfers"
              onClick={() => onModuleSelect?.({ type: 'standard', tab: 'standard' })}
              selected={selectedModuleId === 'standard'}
            />
            <NavItem
              icon="💰"
              label="Fiat Gateway"
              onClick={() => onModuleSelect?.({ type: 'standard', tab: 'fiat' })}
              selected={selectedModuleId === 'fiat'}
            />
          </div>
        )}
      </div>

      {/* Predefined Blockchain Modules */}
      {predefinedModules.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <div
            onClick={() => toggleSection('blockchain')}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.75rem',
              cursor: 'pointer',
              color: 'white',
              fontWeight: 600,
              fontSize: '0.9rem',
              borderRadius: '8px',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.1)'}
            onMouseLeave={(e) => e.target.style.background = 'transparent'}
          >
            <span>🔗 Blockchain Modules</span>
            <span style={{ fontSize: '0.8rem' }}>
              {expandedSections.blockchain ? '▼' : '▶'}
            </span>
          </div>

          {expandedSections.blockchain && (
            <div style={{ marginTop: '0.5rem', paddingLeft: '0.5rem' }}>
              {predefinedModules.map(module => (
                <NavItem
                  key={module.moduleId}
                  icon={module.icon}
                  label={module.displayName}
                  onClick={() => handleModuleClick(module)}
                  selected={selectedModuleId === module.moduleId}
                  badge={module.moduleType}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Custom Modules */}
      {customModules.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <div
            onClick={() => toggleSection('custom')}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.75rem',
              cursor: 'pointer',
              color: 'white',
              fontWeight: 600,
              fontSize: '0.9rem',
              borderRadius: '8px',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.1)'}
            onMouseLeave={(e) => e.target.style.background = 'transparent'}
          >
            <span>🚀 Custom Modules</span>
            <span style={{ fontSize: '0.8rem' }}>
              {expandedSections.custom ? '▼' : '▶'}
            </span>
          </div>

          {expandedSections.custom && (
            <div style={{ marginTop: '0.5rem', paddingLeft: '0.5rem' }}>
              {customModules.map(module => (
                <NavItem
                  key={module.moduleId}
                  icon={module.icon}
                  label={module.displayName}
                  onClick={() => handleModuleClick(module)}
                  selected={selectedModuleId === module.moduleId}
                  badge="CUSTOM"
                  isCustom
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Admin Section */}
      {(role === 'admin' || role === 'TREASURY' || role === 'COMPLIANCE') && (
        <div>
          <div
            onClick={() => toggleSection('admin')}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.75rem',
              cursor: 'pointer',
              color: 'white',
              fontWeight: 600,
              fontSize: '0.9rem',
              borderRadius: '8px',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.1)'}
            onMouseLeave={(e) => e.target.style.background = 'transparent'}
          >
            <span>⚙️ Admin</span>
            <span style={{ fontSize: '0.8rem' }}>
              {expandedSections.admin ? '▼' : '▶'}
            </span>
          </div>

          {expandedSections.admin && (
            <div style={{ marginTop: '0.5rem', paddingLeft: '0.5rem' }}>
              <NavItem
                icon="🔑"
                label="API Keys"
                onClick={() => onModuleSelect?.({ type: 'admin', tab: 'api-keys' })}
                selected={selectedModuleId === 'api-keys'}
              />
              <NavItem
                icon="💸"
                label="Disbursements"
                onClick={() => onModuleSelect?.({ type: 'admin', tab: 'disbursements' })}
                selected={selectedModuleId === 'disbursements'}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Navigation Item Component
 */
function NavItem({ icon, label, onClick, selected, badge, isCustom }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.75rem 1rem',
        borderRadius: '8px',
        cursor: 'pointer',
        background: selected ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
        border: selected ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid transparent',
        transition: 'all 0.2s',
        marginBottom: '0.25rem'
      }}
      onMouseEnter={(e) => {
        if (!selected) {
          e.target.style.background = 'rgba(255, 255, 255, 0.08)';
        }
      }}
      onMouseLeave={(e) => {
        if (!selected) {
          e.target.style.background = 'transparent';
        }
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <span style={{ fontSize: '1.2rem' }}>{icon}</span>
        <span style={{ 
          color: 'white', 
          fontSize: '0.9rem',
          fontWeight: selected ? 600 : 400
        }}>
          {label}
        </span>
      </div>
      
      {badge && (
        <span style={{
          padding: '0.15rem 0.5rem',
          borderRadius: '4px',
          background: isCustom ? 'rgba(102, 126, 234, 0.3)' : 'rgba(78, 205, 196, 0.3)',
          color: isCustom ? '#667eea' : '#4ecdc4',
          fontSize: '0.7rem',
          fontWeight: 600
        }}>
          {badge}
        </span>
      )}
    </div>
  );
}

export default DynamicNavigation;

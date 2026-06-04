/**
 * Blockchain Modules Dashboard
 * Displays all blockchain-enabled modules with filtering and statistics
 */

import { useState, useEffect } from 'react';
import { listModules, getStats } from '../services/orchestrator.service';
import BlockchainModuleCard from './BlockchainModuleCard';
import EnableBlockchain from './EnableBlockchain';

function BlockchainModules({ role }) {
  const [modules, setModules] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    moduleType: '',
    status: '',
    enabled: true
  });
  const [showEnableForm, setShowEnableForm] = useState(false);

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [modulesData, statsData] = await Promise.all([
        listModules(filters),
        getStats()
      ]);

      setModules(modulesData.modules || []);
      setStats(statsData);
    } catch (err) {
      console.error('Error fetching blockchain modules:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load modules');
    } finally {
      setLoading(false);
    }
  };

  const handleModuleEnabled = () => {
    setShowEnableForm(false);
    fetchData();
  };

  const handleModuleUpdated = () => {
    fetchData();
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === '' ? undefined : value
    }));
  };

  return (
    <div className="blockchain-modules-container" style={{
      padding: '2rem',
      maxWidth: '1400px',
      margin: '0 auto'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '2rem', color: 'white' }}>
            🔗 Blockchain Modules
          </h2>
          <p style={{ margin: '0.5rem 0 0 0', color: 'rgba(255,255,255,0.7)' }}>
            Manage blockchain-enabled modules
          </p>
        </div>

        {role === 'admin' && (
          <button
            onClick={() => setShowEnableForm(!showEnableForm)}
            style={{
              padding: '1rem 2rem',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: 600,
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}
          >
            {showEnableForm ? '✕ Cancel' : '+ Enable Blockchain'}
          </button>
        )}
      </div>

      {/* Statistics */}
      {stats && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            background: 'rgba(255,255,255,0.1)',
            padding: '1.5rem',
            borderRadius: '12px',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white' }}>
              {stats.total}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.7)', marginTop: '0.5rem' }}>
              Total Modules
            </div>
          </div>

          <div style={{
            background: 'rgba(102, 126, 234, 0.2)',
            padding: '1.5rem',
            borderRadius: '12px',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#667eea' }}>
              {stats.enabled}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.7)', marginTop: '0.5rem' }}>
              Enabled
            </div>
          </div>

          <div style={{
            background: 'rgba(255, 107, 107, 0.2)',
            padding: '1.5rem',
            borderRadius: '12px',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ff6b6b' }}>
              {stats.disabled}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.7)', marginTop: '0.5rem' }}>
              Disabled
            </div>
          </div>

          <div style={{
            background: 'rgba(78, 205, 196, 0.2)',
            padding: '1.5rem',
            borderRadius: '12px',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#4ecdc4' }}>
              {Object.keys(stats.byType || {}).length}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.7)', marginTop: '0.5rem' }}>
              Module Types
            </div>
          </div>
        </div>
      )}

      {/* Enable Form */}
      {showEnableForm && role === 'admin' && (
        <div style={{ marginBottom: '2rem' }}>
          <EnableBlockchain onSuccess={handleModuleEnabled} />
        </div>
      )}

      {/* Filters */}
      <div style={{
        background: 'rgba(255,255,255,0.1)',
        padding: '1.5rem',
        borderRadius: '12px',
        marginBottom: '2rem',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem'
        }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'white' }}>
              Module Type
            </label>
            <select
              value={filters.moduleType || ''}
              onChange={(e) => handleFilterChange('moduleType', e.target.value)}
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
              <option value="">All Types</option>
              <option value="FUND">Fund</option>
              <option value="TREASURY">Treasury</option>
              <option value="GRANT">Grant</option>
              <option value="REGISTRY">Registry</option>
              <option value="PAYMENT">Payment</option>
              <option value="TOKEN">Token</option>
              <option value="NFT">NFT</option>
              <option value="ROUTER">Router</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'white' }}>
              Status
            </label>
            <select
              value={filters.status || ''}
              onChange={(e) => handleFilterChange('status', e.target.value)}
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
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'white' }}>
              Enabled
            </label>
            <select
              value={filters.enabled === undefined ? '' : filters.enabled.toString()}
              onChange={(e) => handleFilterChange('enabled', e.target.value === '' ? undefined : e.target.value === 'true')}
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
              <option value="">All</option>
              <option value="true">Enabled</option>
              <option value="false">Disabled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          background: 'rgba(255, 107, 107, 0.2)',
          border: '1px solid rgba(255, 107, 107, 0.5)',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '2rem',
          color: '#ff6b6b'
        }}>
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'white' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
          <div>Loading modules...</div>
        </div>
      )}

      {/* Modules List */}
      {!loading && modules.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '12px',
          color: 'rgba(255,255,255,0.7)'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📦</div>
          <div style={{ fontSize: '1.2rem' }}>No modules found</div>
          <div style={{ marginTop: '0.5rem' }}>
            {role === 'admin' ? 'Click "Enable Blockchain" to get started' : 'No blockchain-enabled modules yet'}
          </div>
        </div>
      )}

      {!loading && modules.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '1.5rem'
        }}>
          {modules.map(module => (
            <BlockchainModuleCard
              key={module.moduleId}
              module={module}
              role={role}
              onUpdate={handleModuleUpdated}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default BlockchainModules;

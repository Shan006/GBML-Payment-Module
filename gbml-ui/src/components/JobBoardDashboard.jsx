import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const JOB_STATUS_MAP = {
  0: { label: 'OPEN', color: '#43e97b' },
  1: { label: 'ASSIGNED', color: '#4facfe' },
  2: { label: 'COMPLETED', color: '#667eea' },
  3: { label: 'DISPUTED', color: '#f5576c' },
  4: { label: 'RESOLVED', color: '#38f9d7' },
  5: { label: 'CANCELLED', color: '#888' }
};

function JobBoardDashboard({ moduleId }) {
  const [stats, setStats] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [jobIdInput, setJobIdInput] = useState('');
  const [searchedJob, setSearchedJob] = useState(null);

  useEffect(() => {
    loadStats();
  }, [moduleId]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const [statsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/gbml/jobs/${moduleId}/stats`)
      ]);
      setStats(statsRes.data);
    } catch (err) {
      console.error('Failed to load job board stats:', err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchJob = async () => {
    if (!jobIdInput) return;
    try {
      const res = await axios.get(`${API_BASE_URL}/gbml/jobs/${moduleId}/${jobIdInput}`);
      setSearchedJob(res.data.job);
    } catch (err) {
      setError('Job not found: ' + (err.response?.data?.message || err.message));
    }
  };

  if (loading) {
    return (
      <WidgetContainer title="Job Board" icon="💼">
        <p style={{ color: 'rgba(255,255,255,0.7)' }}>Loading job data...</p>
      </WidgetContainer>
    );
  }

  return (
    <WidgetContainer title="Job Board" icon="💼">
      {error && (
        <div style={{ color: '#ff6b6b', marginBottom: '1rem', fontSize: '0.9rem' }}>
          {error}
        </div>
      )}

      {stats && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}>
          <StatCard icon="📋" label="Total Jobs" value={stats.totalJobs} color="#4facfe" />
          <StatCard icon="💰" label="Escrow Balance" value={stats.escrowBalance} color="#43e97b" />
          <StatCard icon="⭐" label="Total Ratings" value={stats.totalRatings} color="#f093fb" />
          <StatCard icon="📄" label="Escrow Contract" value={formatAddress(stats.escrowAddress)} color="#667eea" />
        </div>
      )}

      <div style={{
        background: 'rgba(255,255,255,0.05)',
        borderRadius: '8px',
        padding: '1rem',
        marginBottom: '1rem'
      }}>
        <h4 style={{ margin: '0 0 0.75rem 0', color: 'white', fontSize: '0.95rem' }}>
          🔍 Lookup Job
        </h4>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            value={jobIdInput}
            onChange={(e) => setJobIdInput(e.target.value)}
            placeholder="Enter Job ID..."
            style={{
              flex: 1,
              padding: '0.5rem 0.75rem',
              borderRadius: '6px',
              border: '1px solid rgba(255,255,255,0.2)',
              background: 'rgba(255,255,255,0.1)',
              color: 'white',
              fontSize: '0.9rem'
            }}
          />
          <button
            onClick={handleSearchJob}
            style={{
              padding: '0.5rem 1rem',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Search
          </button>
        </div>

        {searchedJob && (
          <div style={{
            marginTop: '0.75rem',
            padding: '0.75rem',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '6px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ color: 'white', fontWeight: 600 }}>Job #{searchedJob.jobId}</span>
              <span style={{
                padding: '0.15rem 0.5rem',
                borderRadius: '4px',
                background: `${(JOB_STATUS_MAP[searchedJob.status]?.color || '#888')}33`,
                color: JOB_STATUS_MAP[searchedJob.status]?.color || '#888',
                fontSize: '0.8rem',
                fontWeight: 600
              }}>
                {searchedJob.status}
              </span>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.8 }}>
              <div><strong>Employer:</strong> {formatAddress(searchedJob.employer)}</div>
              <div><strong>Freelancer:</strong> {searchedJob.freelancer !== '0x0000000000000000000000000000000000000000' ? formatAddress(searchedJob.freelancer) : 'Not assigned'}</div>
              <div><strong>Budget:</strong> {searchedJob.budget}</div>
              <div><strong>Created:</strong> {new Date(searchedJob.createdAt).toLocaleDateString()}</div>
              {searchedJob.winner !== '0x0000000000000000000000000000000000000000' && (
                <div><strong>Winner:</strong> {formatAddress(searchedJob.winner)}</div>
              )}
            </div>
          </div>
        )}
      </div>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem'
      }}>
        <h4 style={{ margin: 0, color: 'white', fontSize: '0.95rem' }}>
          ⚡ Quick Actions
        </h4>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: '0.5rem'
        }}>
          <ActionButton label="Post Job" icon="➕" color="#43e97b" onClick={() => window.open(`${API_BASE_URL}/gbml/jobs/${moduleId}/create`, '_blank')} />
          <ActionButton label="Escrow" icon="💰" color="#4facfe" onClick={() => window.open(`${API_BASE_URL}/gbml/jobs/${moduleId}/escrow-balance`, '_blank')} />
          <ActionButton label="Stats" icon="📊" color="#f093fb" onClick={() => window.open(`${API_BASE_URL}/gbml/jobs/${moduleId}/stats`, '_blank')} />
          <ActionButton label="Rate User" icon="⭐" color="#ff9a9e" onClick={() => window.open(`${API_BASE_URL}/gbml/reputation/${moduleId}/rate`, '_blank')} />
        </div>
      </div>
    </WidgetContainer>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <div style={{
      padding: '1rem',
      background: 'rgba(255,255,255,0.05)',
      borderRadius: '8px',
      border: `1px solid ${color}33`
    }}>
      <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{icon}</div>
      <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem' }}>{label}</div>
      <div style={{ color: 'white', fontWeight: 600, fontSize: '1.1rem', marginTop: '0.25rem' }}>{value}</div>
    </div>
  );
}

function ActionButton({ label, icon, color, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '0.75rem',
        background: `${color}22`,
        border: `1px solid ${color}55`,
        borderRadius: '8px',
        color: 'white',
        cursor: 'pointer',
        fontSize: '0.85rem',
        transition: 'all 0.2s',
        textAlign: 'center'
      }}
    >
      <div style={{ fontSize: '1.2rem' }}>{icon}</div>
      <div style={{ marginTop: '0.25rem' }}>{label}</div>
    </button>
  );
}

function WidgetContainer({ title, icon, children }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.08)',
      borderRadius: '12px',
      padding: '1.5rem',
      border: '1px solid rgba(255,255,255,0.1)'
    }}>
      <h3 style={{ margin: '0 0 1rem 0', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {icon} {title}
      </h3>
      {children}
    </div>
  );
}

function formatAddress(addr) {
  if (!addr || addr === '0x0000000000000000000000000000000000000000') return 'N/A';
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export default JobBoardDashboard;

/**
 * Enable Blockchain Form
 * Form to enable blockchain for a new module with premium UX
 */

import { useState } from 'react';
import { enableBlockchain, MODULE_TYPES } from '../services/orchestrator.service';
import ServiceStepIndicator from './ui/ServiceStepIndicator';
import ProgressStepper from './ui/ProgressStepper';
import ErrorDisplay from './ui/ErrorDisplay';
import SuccessCard from './ui/SuccessCard';

function EnableBlockchain({ onSuccess }) {
  const [formData, setFormData] = useState({
    moduleId: '',
    moduleType: 'FUND'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [progressStep, setProgressStep] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.moduleId.trim()) {
      setError('Module ID is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      setProgressStep(1);

      // Simulate progress stages for better UX
      const progressInterval = setInterval(() => {
        setProgressStep(prev => {
          if (prev < 5) return prev + 1;
          return prev;
        });
      }, 800);

      const result = await enableBlockchain({
        moduleId: formData.moduleId.trim(),
        moduleType: formData.moduleType
      });

      clearInterval(progressInterval);
      setProgressStep(5);
      setSuccess(result);
      
      // Reset form
      setFormData({
        moduleId: '',
        moduleType: 'FUND'
      });

      // Do NOT auto-navigate - let user review success details before proceeding
    } catch (err) {
      console.error('Error enabling blockchain:', err);
      const details = err.response?.data?.details;
      const baseMessage = err.response?.data?.message || err.response?.data?.error || err.message;
      setError(
        Array.isArray(details) && details.length > 0
          ? `${baseMessage}: ${details.join(', ')}`
          : baseMessage || 'Failed to enable blockchain'
      );
      setProgressStep(0);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    handleSubmit(new Event('submit'));
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError(null);
    setSuccess(null);
  };

  const selectedType = MODULE_TYPES.find(t => t.value === formData.moduleType);

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
      padding: '2.5rem',
      borderRadius: '16px',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255,255,255,0.2)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
    }}>
      <h3 style={{ 
        margin: '0 0 0.5rem 0', 
        color: 'white', 
        fontSize: '1.75rem',
        fontWeight: 700,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text'
      }}>
        🚀 Enable Blockchain for Module
      </h3>
      <p style={{
        color: 'rgba(255,255,255,0.6)',
        fontSize: '0.9rem',
        marginBottom: '2rem',
        marginTop: '0.5rem'
      }}>
        One-click deployment with JVD EGCR routing enforcement
      </p>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{
            display: 'block',
            marginBottom: '0.5rem',
            color: 'rgba(255,255,255,0.9)',
            fontWeight: 600,
            fontSize: '0.9rem'
          }}>
            Module ID *
          </label>
          <input
            type="text"
            value={formData.moduleId}
            onChange={(e) => handleChange('moduleId', e.target.value)}
            placeholder="e.g., fund-001, treasury-main"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.875rem 1rem',
              borderRadius: '10px',
              border: '1px solid rgba(255,255,255,0.2)',
              background: 'rgba(255,255,255,0.08)',
              color: 'white',
              fontSize: '1rem',
              transition: 'all 0.2s',
              outline: 'none'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'rgba(102, 126, 234, 0.5)';
              e.target.style.background = 'rgba(255,255,255,0.12)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(255,255,255,0.2)';
              e.target.style.background = 'rgba(255,255,255,0.08)';
            }}
          />
          <small style={{ color: 'rgba(255,255,255,0.5)', marginTop: '0.25rem', display: 'block', fontSize: '0.85rem' }}>
            Unique identifier for this module
          </small>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{
            display: 'block',
            marginBottom: '0.5rem',
            color: 'rgba(255,255,255,0.9)',
            fontWeight: 600,
            fontSize: '0.9rem'
          }}>
            Module Type *
          </label>
          <select
            value={formData.moduleType}
            onChange={(e) => handleChange('moduleType', e.target.value)}
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.875rem 1rem',
              borderRadius: '10px',
              border: '1px solid rgba(255,255,255,0.2)',
              background: 'rgba(255,255,255,0.08)',
              color: 'black',
              fontSize: '1rem',
              transition: 'all 0.2s',
              outline: 'none',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'rgba(102, 126, 234, 0.5)';
              e.target.style.background = 'rgba(255,255,255,0.12)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(255,255,255,0.2)';
              e.target.style.background = 'rgba(255,255,255,0.08)';
            }}
          >
            {MODULE_TYPES.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          {selectedType && (
            <small style={{ color: 'rgba(255,255,255,0.5)', marginTop: '0.25rem', display: 'block', fontSize: '0.85rem' }}>
              {selectedType.description}
            </small>
          )}
        </div>

        {/* Service Step Indicator */}
        <ServiceStepIndicator moduleType={formData.moduleType} />

        {/* Progress Stepper */}
        {loading && (
          <ProgressStepper currentStep={progressStep} totalSteps={5} />
        )}

        {/* Error Display */}
        {error && (
          <ErrorDisplay error={error} onRetry={handleRetry} />
        )}

        {/* Success Card */}
        {success && (
          <>
            <SuccessCard success={success} />
            
            {/* Go to Dashboard Button */}
            <button
              onClick={() => onSuccess && onSuccess(success)}
              style={{
                width: '100%',
                padding: '1rem 1.25rem',
                background: 'linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: 600,
                boxShadow: '0 4px 15px rgba(78, 205, 196, 0.4)',
                transition: 'all 0.3s ease',
                marginTop: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 20px rgba(78, 205, 196, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 15px rgba(78, 205, 196, 0.4)';
              }}
            >
              <span>📊</span>
              <span>Go to Dashboard</span>
            </button>
          </>
        )}

        {/* Submit Button - Hide when success is shown */}
        {!success && (
        <button
          type="submit"
          disabled={loading || !formData.moduleId.trim()}
          style={{
            width: '100%',
            padding: '1rem 1.25rem',
            background: loading || !formData.moduleId.trim() 
              ? 'rgba(255,255,255,0.1)' 
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: loading || !formData.moduleId.trim() 
              ? '1px solid rgba(255,255,255,0.1)' 
              : 'none',
            borderRadius: '10px',
            cursor: loading || !formData.moduleId.trim() ? 'not-allowed' : 'pointer',
            fontSize: '1rem',
            fontWeight: 600,
            boxShadow: loading || !formData.moduleId.trim() 
              ? 'none' 
              : '0 4px 15px rgba(102, 126, 234, 0.4)',
            transition: 'all 0.3s ease',
            position: 'relative',
            overflow: 'hidden'
          }}
          onMouseEnter={(e) => {
            if (!loading && formData.moduleId.trim()) {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.5)';
            }
          }}
          onMouseLeave={(e) => {
            if (!loading && formData.moduleId.trim()) {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
            }
          }}
        >
          {loading ? (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <span style={{ animation: 'spin 1s linear infinite' }}>⏳</span>
              <span>Enabling Blockchain...</span>
            </span>
          ) : (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <span>🚀</span>
              <span>Enable Blockchain</span>
            </span>
          )}
        </button>
        )}
      </form>

      <div style={{
        marginTop: '1.5rem',
        padding: '1.25rem',
        borderRadius: '12px',
        background: 'rgba(0,0,0,0.2)',
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600, marginBottom: '0.75rem', fontSize: '0.9rem' }}>
          💡 Tips
        </div>
        <ul style={{
          margin: 0,
          paddingLeft: '1.25rem',
          color: 'rgba(255,255,255,0.6)',
          fontSize: '0.85rem',
          lineHeight: 1.7
        }}>
          <li style={{ marginBottom: '0.5rem' }}>Use a unique, descriptive module ID (e.g. <code style={{ color: 'rgba(255,255,255,0.8)', background: 'rgba(255,255,255,0.1)', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>fund-001</code>)</li>
          <li style={{ marginBottom: '0.5rem' }}>Enablement typically takes 30–60 seconds while the contract deploys</li>
          <li style={{ marginBottom: '0.5rem' }}>Constructor parameters are auto-generated unless you pass them via the API</li>
          <li>Payment modules automatically enable wallet, settlement, and fiat conversion</li>
        </ul>
      </div>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default EnableBlockchain;
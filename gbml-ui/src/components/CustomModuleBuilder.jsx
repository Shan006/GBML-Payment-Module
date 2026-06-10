/**
 * Custom Module Builder / Configurator
 * Allows users to visually construct and deploy custom modules
 */

import { useState } from 'react';
import { registerCustomModule, enableCustomModule, updateCustomModule } from '../services/custom-module.service';
import { 
  AVAILABLE_CONTRACT_TYPES, 
  ICON_OPTIONS, 
  COLOR_OPTIONS,
  PREDEFINED_MODULE_TYPES 
} from '../types/module.types';

function CustomModuleBuilder({ onSuccess, onCancel }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    moduleId: '',
    moduleName: '',
    description: '',
    moduleType: 'CUSTOM',
    icon: '🚀',
    primaryColor: '#667eea',
    selectedContracts: [],
    services: {
      wallet: true,
      settlement: true,
      conversion: false
    },
    compliance: {
      kycRequired: true,
      amlRequired: true
    },
    customContracts: []
  });

  // Custom contract form state
  const [showCustomContractForm, setShowCustomContractForm] = useState(false);
  const [customContract, setCustomContract] = useState({
    contractName: '',
    contractType: 'CUSTOM',
    abi: '',
    bytecode: ''
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleServiceToggle = (service) => {
    setFormData(prev => ({
      ...prev,
      services: {
        ...prev.services,
        [service]: !prev.services[service]
      }
    }));
  };

  const handleComplianceToggle = (compliance) => {
    setFormData(prev => ({
      ...prev,
      compliance: {
        ...prev.compliance,
        [compliance]: !prev.compliance[compliance]
      }
    }));
  };

  const handleContractToggle = (contractType) => {
    setFormData(prev => ({
      ...prev,
      selectedContracts: prev.selectedContracts.includes(contractType)
        ? prev.selectedContracts.filter(c => c !== contractType)
        : [...prev.selectedContracts, contractType]
    }));
  };

  const handleAddCustomContract = () => {
    if (!customContract.contractName || !customContract.abi || !customContract.bytecode) {
      setError('Please fill in all custom contract fields');
      return;
    }

    setFormData(prev => ({
      ...prev,
      customContracts: [...prev.customContracts, { ...customContract }]
    }));

    setCustomContract({
      contractName: '',
      contractType: 'CUSTOM',
      abi: '',
      bytecode: ''
    });
    setShowCustomContractForm(false);
  };

  const handleRemoveCustomContract = (index) => {
    setFormData(prev => ({
      ...prev,
      customContracts: prev.customContracts.filter((_, i) => i !== index)
    }));
  };

  const validateStep1 = () => {
    if (!formData.moduleId || !formData.moduleName || !formData.description) {
      setError('Please fill in all required fields');
      return false;
    }
    if (formData.selectedContracts.length === 0 && formData.customContracts.length === 0) {
      setError('Please select at least one contract type or add a custom contract');
      return false;
    }
    setError(null);
    return true;
  };

  const validateStep2 = () => {
    setError(null);
    return true;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      handleSubmit();
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      // Build contract definitions
      const contractDefinitions = formData.selectedContracts.map(type => ({
        contractName: `${formData.moduleId}_${type.toLowerCase()}`,
        contractType: type,
        abi: [], // Will be loaded from standard templates
        bytecode: '' // Will be loaded from standard templates
      }));

      // Add custom contracts
      contractDefinitions.push(...formData.customContracts);

      // Register the custom module
      const moduleData = {
        moduleId: formData.moduleId,
        moduleName: formData.moduleName,
        moduleType: formData.moduleType,
        description: formData.description,
        contracts: contractDefinitions,
        services: formData.services,
        compliance: formData.compliance,
        uiProperties: {
          icon: formData.icon,
          primaryColor: formData.primaryColor,
          displayName: formData.moduleName
        }
      };

      try {
        await registerCustomModule(moduleData);
      } catch (regErr) {
        // If duplicate key error, module already exists - try to update it instead
        if (regErr.response?.data?.message?.includes('duplicate key') || 
            regErr.response?.data?.message?.includes('unique constraint')) {
          console.log('Module already exists, attempting to update...');
          try {
            await updateCustomModule(formData.moduleId, moduleData);
          } catch (updateErr) {
            throw new Error(`Failed to update existing module: ${updateErr.response?.data?.message || updateErr.message}`);
          }
        } else {
          throw regErr;
        }
      }

      // Enable the module (deploy contracts)
      const enableData = {
        moduleId: formData.moduleId,
        serviceId: formData.moduleId,
        moduleType: formData.moduleType,
        contractDefinitions: contractDefinitions
      };

      await enableCustomModule(enableData);

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error('Error creating custom module:', err);
      setError(err.response?.data?.message || err.message || 'Failed to create custom module');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
      borderRadius: '16px',
      padding: '2rem',
      maxWidth: '800px',
      margin: '0 auto',
      border: '1px solid rgba(255, 255, 255, 0.2)'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ 
          margin: 0, 
          fontSize: '1.8rem', 
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          🚀 Custom Module Builder
        </h2>
        <p style={{ margin: '0.5rem 0 0 0', color: 'rgba(255, 255, 255, 0.7)' }}>
          Create and deploy your own custom GBML module
        </p>
      </div>

      {/* Progress Steps */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '2rem'
      }}>
        {[1, 2].map(s => (
          <div
            key={s}
            style={{
              flex: 1,
              height: '4px',
              background: step >= s ? formData.primaryColor : 'rgba(255, 255, 255, 0.2)',
              borderRadius: '2px',
              transition: 'all 0.3s'
            }}
          />
        ))}
      </div>

      {/* Error */}
      {error && (
        <div style={{
          background: 'rgba(255, 107, 107, 0.2)',
          border: '1px solid rgba(255, 107, 107, 0.5)',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '1.5rem',
          color: '#ff6b6b'
        }}>
          {error}
        </div>
      )}

      {/* Step 1: Basic Info & Contract Selection */}
      {step === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Module ID */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'white', fontWeight: 500 }}>
              Module ID *
            </label>
            <input
              type="text"
              value={formData.moduleId}
              onChange={(e) => handleInputChange('moduleId', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
              placeholder="e.g., circular-economy-credits"
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                fontSize: '1rem'
              }}
            />
          </div>

          {/* Module Name */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'white', fontWeight: 500 }}>
              Module Name *
            </label>
            <input
              type="text"
              value={formData.moduleName}
              onChange={(e) => handleInputChange('moduleName', e.target.value)}
              placeholder="e.g., Circular Economy Credits System"
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                fontSize: '1rem'
              }}
            />
          </div>

          {/* Description */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'white', fontWeight: 500 }}>
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe what your module does..."
              rows={3}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                fontSize: '1rem',
                resize: 'vertical'
              }}
            />
          </div>

          {/* Icon Selection */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'white', fontWeight: 500 }}>
              Module Icon
            </label>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.5rem'
            }}>
              {ICON_OPTIONS.map(icon => (
                <button
                  key={icon}
                  onClick={() => handleInputChange('icon', icon)}
                  style={{
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: formData.icon === icon ? '2px solid white' : '1px solid rgba(255, 255, 255, 0.2)',
                    background: formData.icon === icon ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                    fontSize: '1.5rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Color Selection */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'white', fontWeight: 500 }}>
              Primary Color
            </label>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.5rem'
            }}>
              {COLOR_OPTIONS.map(color => (
                <button
                  key={color}
                  onClick={() => handleInputChange('primaryColor', color)}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    border: formData.primaryColor === color ? '3px solid white' : '2px solid rgba(255, 255, 255, 0.2)',
                    background: color,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                />
              ))}
            </div>
          </div>

          {/* Contract Selection */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'white', fontWeight: 500 }}>
              Contract Stack (select at least one)
            </label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '1rem'
            }}>
              {AVAILABLE_CONTRACT_TYPES.map(contract => (
                <div
                  key={contract.value}
                  onClick={() => handleContractToggle(contract.value)}
                  style={{
                    padding: '1rem',
                    borderRadius: '8px',
                    border: formData.selectedContracts.includes(contract.value) 
                      ? '2px solid white' 
                      : '1px solid rgba(255, 255, 255, 0.2)',
                    background: formData.selectedContracts.includes(contract.value)
                      ? 'rgba(255, 255, 255, 0.2)'
                      : 'rgba(255, 255, 255, 0.1)',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                    {contract.icon}
                  </div>
                  <div style={{ color: 'white', fontWeight: 500 }}>
                    {contract.label}
                  </div>
                  <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                    {contract.description}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Custom Contract Button */}
          <div>
            <button
              onClick={() => setShowCustomContractForm(!showCustomContractForm)}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px dashed rgba(255, 255, 255, 0.4)',
                color: 'white',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              + Add Custom Contract
            </button>
          </div>

          {/* Custom Contract Form */}
          {showCustomContractForm && (
            <div style={{
              background: 'rgba(0, 0, 0, 0.2)',
              padding: '1.5rem',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <h4 style={{ margin: '0 0 1rem 0', color: 'white' }}>Custom Contract</h4>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'white' }}>
                    Contract Name
                  </label>
                  <input
                    type="text"
                    value={customContract.contractName}
                    onChange={(e) => setCustomContract(prev => ({ ...prev, contractName: e.target.value }))}
                    placeholder="e.g., MyCustomContract"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      background: 'rgba(255, 255, 255, 0.1)',
                      color: 'white'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'white' }}>
                    ABI (JSON)
                  </label>
                  <textarea
                    value={customContract.abi}
                    onChange={(e) => setCustomContract(prev => ({ ...prev, abi: e.target.value }))}
                    placeholder='[{"inputs":[...],"stateMutability":"nonpayable","type":"constructor"}]'
                    rows={4}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      background: 'rgba(255, 255, 255, 0.1)',
                      color: 'white',
                      fontFamily: 'monospace',
                      fontSize: '0.85rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'white' }}>
                    Bytecode
                  </label>
                  <textarea
                    value={customContract.bytecode}
                    onChange={(e) => setCustomContract(prev => ({ ...prev, bytecode: e.target.value }))}
                    placeholder="0x608060405234801561001057600080fd5b50..."
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      background: 'rgba(255, 255, 255, 0.1)',
                      color: 'white',
                      fontFamily: 'monospace',
                      fontSize: '0.85rem'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button
                    onClick={handleAddCustomContract}
                    style={{
                      padding: '0.75rem 1.5rem',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: 600
                    }}
                  >
                    Add Contract
                  </button>
                  <button
                    onClick={() => {
                      setShowCustomContractForm(false);
                      setCustomContract({
                        contractName: '',
                        contractType: 'CUSTOM',
                        abi: '',
                        bytecode: ''
                      });
                    }}
                    style={{
                      padding: '0.75rem 1.5rem',
                      background: 'rgba(255, 107, 107, 0.2)',
                      color: '#ff6b6b',
                      border: '1px solid rgba(255, 107, 107, 0.5)',
                      borderRadius: '8px',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Custom Contracts List */}
          {formData.customContracts.length > 0 && (
            <div>
              <h4 style={{ margin: '0 0 1rem 0', color: 'white' }}>Custom Contracts ({formData.customContracts.length})</h4>
              {formData.customContracts.map((contract, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '8px',
                    marginBottom: '0.5rem'
                  }}
                >
                  <div>
                    <div style={{ color: 'white', fontWeight: 500 }}>{contract.contractName}</div>
                    <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.85rem' }}>
                      {contract.contractType}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveCustomContract(index)}
                    style={{
                      padding: '0.5rem 1rem',
                      background: 'rgba(255, 107, 107, 0.2)',
                      color: '#ff6b6b',
                      border: '1px solid rgba(255, 107, 107, 0.5)',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.85rem'
                    }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 2: Services & Compliance */}
      {step === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Services */}
          <div>
            <h3 style={{ margin: '0 0 1rem 0', color: 'white' }}>GBML Services</h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem'
            }}>
              {[
                { key: 'wallet', label: 'Wallet Service', icon: '💼', description: 'Integrated wallet management' },
                { key: 'settlement', label: 'Settlement Service', icon: '💰', description: 'Payment settlement routing' },
                { key: 'conversion', label: 'Conversion Service', icon: '🔄', description: 'Token conversion capabilities' }
              ].map(service => (
                <div
                  key={service.key}
                  onClick={() => handleServiceToggle(service.key)}
                  style={{
                    padding: '1.5rem',
                    borderRadius: '12px',
                    border: formData.services[service.key] 
                      ? '2px solid white' 
                      : '1px solid rgba(255, 255, 255, 0.2)',
                    background: formData.services[service.key]
                      ? 'rgba(255, 255, 255, 0.2)'
                      : 'rgba(255, 255, 255, 0.05)',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                    {service.icon}
                  </div>
                  <div style={{ color: 'white', fontWeight: 600, marginBottom: '0.25rem' }}>
                    {service.label}
                  </div>
                  <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.85rem' }}>
                    {service.description}
                  </div>
                  <div style={{
                    marginTop: '0.75rem',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '4px',
                    background: formData.services[service.key] 
                      ? 'rgba(78, 205, 196, 0.3)' 
                      : 'rgba(255, 107, 107, 0.3)',
                    color: formData.services[service.key] ? '#4ecdc4' : '#ff6b6b',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    display: 'inline-block'
                  }}>
                    {formData.services[service.key] ? '✓ Enabled' : '✗ Disabled'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Compliance */}
          <div>
            <h3 style={{ margin: '0 0 1rem 0', color: 'white' }}>Compliance Requirements</h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem'
            }}>
              {[
                { key: 'kycRequired', label: 'KYC Verification', icon: '🪪', description: 'Know Your Customer checks' },
                { key: 'amlRequired', label: 'AML Screening', icon: '🔍', description: 'Anti-Money Laundering checks' }
              ].map(compliance => (
                <div
                  key={compliance.key}
                  onClick={() => handleComplianceToggle(compliance.key)}
                  style={{
                    padding: '1.5rem',
                    borderRadius: '12px',
                    border: formData.compliance[compliance.key] 
                      ? '2px solid white' 
                      : '1px solid rgba(255, 255, 255, 0.2)',
                    background: formData.compliance[compliance.key]
                      ? 'rgba(255, 255, 255, 0.2)'
                      : 'rgba(255, 255, 255, 0.05)',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                    {compliance.icon}
                  </div>
                  <div style={{ color: 'white', fontWeight: 600, marginBottom: '0.25rem' }}>
                    {compliance.label}
                  </div>
                  <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.85rem' }}>
                    {compliance.description}
                  </div>
                  <div style={{
                    marginTop: '0.75rem',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '4px',
                    background: formData.compliance[compliance.key] 
                      ? 'rgba(78, 205, 196, 0.3)' 
                      : 'rgba(255, 107, 107, 0.3)',
                    color: formData.compliance[compliance.key] ? '#4ecdc4' : '#ff6b6b',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    display: 'inline-block'
                  }}>
                    {formData.compliance[compliance.key] ? '✓ Required' : '✗ Not Required'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            padding: '1.5rem',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <h4 style={{ margin: '0 0 1rem 0', color: 'white' }}>Module Summary</h4>
            <div style={{ color: 'rgba(255, 255, 255, 0.8)', lineHeight: 1.8 }}>
              <div><strong>Name:</strong> {formData.icon} {formData.moduleName}</div>
              <div><strong>ID:</strong> {formData.moduleId}</div>
              <div><strong>Contracts:</strong> {formData.selectedContracts.length + formData.customContracts.length}</div>
              <div><strong>Services:</strong> {Object.values(formData.services).filter(v => v).length} enabled</div>
              <div><strong>Compliance:</strong> {Object.values(formData.compliance).filter(v => v).length} required</div>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: '2rem',
        paddingTop: '2rem',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <button
          onClick={onCancel}
          disabled={loading}
          style={{
            padding: '0.75rem 2rem',
            background: 'rgba(255, 107, 107, 0.2)',
            color: '#ff6b6b',
            border: '1px solid rgba(255, 107, 107, 0.5)',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '1rem',
            fontWeight: 600
          }}
        >
          Cancel
        </button>

        <div style={{ display: 'flex', gap: '1rem' }}>
          {step > 1 && (
            <button
              onClick={handleBack}
              disabled={loading}
              style={{
                padding: '0.75rem 2rem',
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '1rem',
                fontWeight: 600
              }}
            >
              Back
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={loading}
            style={{
              padding: '0.75rem 2rem',
              background: loading ? 'rgba(255, 255, 255, 0.3)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              fontWeight: 600,
              minWidth: '150px'
            }}
          >
            {loading ? 'Creating...' : step === 1 ? 'Next' : 'Deploy Module'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CustomModuleBuilder;

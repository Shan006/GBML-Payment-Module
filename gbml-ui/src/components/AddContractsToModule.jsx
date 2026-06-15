import { useState, useEffect } from 'react';
import { listCustomModules, addContractsToCustomModule, deployAdditionalContracts } from '../services/custom-module.service';
import { AVAILABLE_CONTRACT_TYPES } from '../types/module.types';

function AddContractsToModule({ onSuccess, onCancel }) {
  const [modules, setModules] = useState([]);
  const [selectedModuleId, setSelectedModuleId] = useState('');
  const [selectedModule, setSelectedModule] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState(null);
  const [newContracts, setNewContracts] = useState([]);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customContract, setCustomContract] = useState({
    contractName: '',
    contractType: 'CUSTOM',
    abi: '',
    bytecode: ''
  });

  useEffect(() => {
    loadModules();
  }, []);

  const loadModules = async () => {
    try {
      setFetching(true);
      const result = await listCustomModules();
      setModules(result.modules || []);
    } catch (err) {
      setError('Failed to load custom modules');
    } finally {
      setFetching(false);
    }
  };

  const handleModuleSelect = (moduleId) => {
    const module = modules.find(m => m.moduleId === moduleId);
    setSelectedModuleId(moduleId);
    setSelectedModule(module);
    setNewContracts([]);
    setError(null);
  };

  const handleContractToggle = (contractType) => {
    setNewContracts(prev => {
      const exists = prev.find(c => c.contractType === contractType && !c._custom);
      if (exists) {
        return prev.filter(c => !(c.contractType === contractType && !c._custom));
      }
      const contractName = `${selectedModuleId}_${contractType.toLowerCase()}`;
      return [...prev, {
        contractName,
        contractType,
        abi: [],
        bytecode: '',
        _temp: true
      }];
    });
  };

  const handleAddCustomContract = () => {
    if (!customContract.contractName || !customContract.abi || !customContract.bytecode) {
      setError('Please fill in all custom contract fields');
      return;
    }
    setNewContracts(prev => [...prev, { ...customContract, _custom: true, _temp: true }]);
    setCustomContract({ contractName: '', contractType: 'CUSTOM', abi: '', bytecode: '' });
    setShowCustomForm(false);
    setError(null);
  };

  const handleRemoveContract = (index) => {
    setNewContracts(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!selectedModuleId) {
      setError('Please select a module');
      return;
    }
    if (newContracts.length === 0) {
      setError('Please add at least one contract');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const contractsToAdd = newContracts.map(c => {
        const { _temp, _custom, ...contract } = c;
        return contract;
      });

      await addContractsToCustomModule(selectedModuleId, contractsToAdd);

      try {
        await deployAdditionalContracts(selectedModuleId, contractsToAdd);
      } catch (deployErr) {
        console.warn('Contracts added to registry but on-chain deployment failed:', deployErr);
        setError('Contracts saved to module but deployment failed: ' + (deployErr.response?.data?.message || deployErr.message));
        return;
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to add contracts');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'rgba(255,255,255,0.7)' }}>
        Loading modules...
      </div>
    );
  }

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
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.8rem', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          + Add Contracts to Module
        </h2>
        <p style={{ margin: '0.5rem 0 0 0', color: 'rgba(255, 255, 255, 0.7)' }}>
          Add new contracts to an existing custom module
        </p>
      </div>

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

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {modules.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'rgba(255,255,255,0.7)', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
            No custom modules found. Create one first.
          </div>
        ) : (
          <>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'white', fontWeight: 500 }}>
                Select Custom Module *
              </label>
              <select
                value={selectedModuleId}
                onChange={(e) => handleModuleSelect(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  fontSize: '1rem'
                }}
              >
                <option value="" style={{ background: '#333' }}>-- Select a module --</option>
                {modules.map(m => (
                  <option key={m.moduleId} value={m.moduleId} style={{ background: '#333' }}>
                    {m.moduleName} ({m.moduleId})
                  </option>
                ))}
              </select>
            </div>

            {selectedModule && (
              <>
                <div style={{
                  background: 'rgba(0, 0, 0, 0.2)',
                  padding: '1rem',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  <h4 style={{ margin: '0 0 0.5rem 0', color: 'white' }}>
                    Existing Contracts ({selectedModule.contracts.length})
                  </h4>
                  {selectedModule.contracts.length === 0 ? (
                    <p style={{ margin: 0, color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>No contracts yet</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {selectedModule.contracts.map((c, i) => (
                        <div key={i} style={{
                          padding: '0.5rem 0.75rem',
                          background: 'rgba(255, 255, 255, 0.05)',
                          borderRadius: '6px',
                          color: 'rgba(255, 255, 255, 0.8)',
                          fontSize: '0.9rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}>
                          <span style={{
                            padding: '0.15rem 0.5rem',
                            borderRadius: '4px',
                            background: 'rgba(102, 126, 234, 0.3)',
                            color: '#667eea',
                            fontSize: '0.75rem',
                            fontWeight: 600
                          }}>
                            {c.contractType}
                          </span>
                          {c.contractName}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'white', fontWeight: 500 }}>
                    Add New Contracts
                  </label>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                    gap: '1rem'
                  }}>
                    {AVAILABLE_CONTRACT_TYPES.filter(ct => ct.value !== 'CUSTOM').map(contract => (
                      <div
                        key={contract.value}
                        onClick={() => handleContractToggle(contract.value)}
                        style={{
                          padding: '1rem',
                          borderRadius: '8px',
                          border: newContracts.find(c => c.contractType === contract.value && !c._custom)
                            ? '2px solid white'
                            : '1px solid rgba(255, 255, 255, 0.2)',
                          background: newContracts.find(c => c.contractType === contract.value && !c._custom)
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

                <div>
                  <button
                    onClick={() => setShowCustomForm(!showCustomForm)}
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

                {showCustomForm && (
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
                          placeholder='[{"inputs":[],"stateMutability":"nonpayable","type":"constructor"}]'
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
                            setShowCustomForm(false);
                            setCustomContract({ contractName: '', contractType: 'CUSTOM', abi: '', bytecode: '' });
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

                {newContracts.length > 0 && (
                  <div>
                    <h4 style={{ margin: '0 0 0.5rem 0', color: 'white' }}>
                      New Contracts to Add ({newContracts.length})
                    </h4>
                    {newContracts.map((c, i) => (
                      <div key={i} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.75rem 1rem',
                        background: 'rgba(78, 205, 196, 0.1)',
                        borderRadius: '8px',
                        marginBottom: '0.5rem',
                        border: '1px solid rgba(78, 205, 196, 0.3)'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{
                            padding: '0.15rem 0.5rem',
                            borderRadius: '4px',
                            background: c._custom ? 'rgba(245, 87, 108, 0.3)' : 'rgba(102, 126, 234, 0.3)',
                            color: c._custom ? '#f5576c' : '#667eea',
                            fontSize: '0.75rem',
                            fontWeight: 600
                          }}>
                            {c.contractType}
                          </span>
                          <span style={{ color: 'white' }}>{c.contractName}</span>
                        </div>
                        <button
                          onClick={() => handleRemoveContract(i)}
                          style={{
                            padding: '0.25rem 0.75rem',
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
              </>
            )}
          </>
        )}
      </div>

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
        <button
          onClick={handleSubmit}
          disabled={loading || !selectedModule || newContracts.length === 0}
          style={{
            padding: '0.75rem 2rem',
            background: loading || !selectedModule || newContracts.length === 0
              ? 'rgba(255, 255, 255, 0.3)'
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: loading || !selectedModule || newContracts.length === 0 ? 'not-allowed' : 'pointer',
            fontSize: '1rem',
            fontWeight: 600,
            minWidth: '150px'
          }}
        >
          {loading ? 'Adding...' : 'Add Contracts'}
        </button>
      </div>
    </div>
  );
}

export default AddContractsToModule;

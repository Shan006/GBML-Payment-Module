import { useState, useEffect } from 'react'
import ModuleList from './components/ModuleList'
import AddModule from './components/AddModule'
import SendPayment from './components/SendPayment'
import FiatPayment from './components/FiatPayment'
import './App.css'

function App() {
  const [selectedModule, setSelectedModule] = useState(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [activeTab, setActiveTab] = useState('standard')

  const handleModuleAdded = (newModule) => {
    // Trigger refresh of module list
    setRefreshTrigger(prev => prev + 1)
  }

  const handleSelectModule = (module) => {
    setSelectedModule(module)
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>GBML Payments Module (JRC-20)</h1>
        <p>Blockchain Payments Management System</p>
      </header>

      <main className="App-main">
        <div className="tabs-container" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '1rem' }}>
          <button
            className={`tab-button ${activeTab === 'standard' ? 'active' : ''}`}
            onClick={() => setActiveTab('standard')}
            style={{
              padding: '1rem 2rem',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              background: activeTab === 'standard' ? 'white' : 'rgba(255,255,255,0.2)',
              color: activeTab === 'standard' ? '#764ba2' : 'white',
              fontWeight: 600,
              fontSize: '1.1rem',
              transition: 'all 0.3s'
            }}
          >
            Token Transfers
          </button>
          <button
            className={`tab-button ${activeTab === 'fiat' ? 'active' : ''}`}
            onClick={() => setActiveTab('fiat')}
            style={{
              padding: '1rem 2rem',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              background: activeTab === 'fiat' ? 'white' : 'rgba(255,255,255,0.2)',
              color: activeTab === 'fiat' ? '#764ba2' : 'white',
              fontWeight: 600,
              fontSize: '1.1rem',
              transition: 'all 0.3s'
            }}
          >
            Fiat Gateway (USD/EUR)
          </button>
        </div>

        {activeTab === 'standard' ? (
          <>
            <div className="modules-section">
              <div className="section-header">
                <h2>Payment Modules</h2>
                <AddModule onModuleAdded={handleModuleAdded} />
              </div>

              <ModuleList
                onSelectModule={handleSelectModule}
                selectedModuleId={selectedModule?.moduleId}
                refreshTrigger={refreshTrigger}
              />
            </div>

            {selectedModule && (
              <div className="payment-section">
                <SendPayment
                  module={selectedModule}
                />
              </div>
            )}

            {!selectedModule && (
              <div className="no-selection">
                <p>Select a payment module from the list above to send payments</p>
              </div>
            )}
          </>
        ) : (
          <div className="payment-section">
            <FiatPayment />
          </div>
        )}
      </main>
    </div>
  )
}

export default App

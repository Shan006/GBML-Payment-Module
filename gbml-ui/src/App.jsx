import { useState, useEffect } from 'react'
import ModuleList from './components/ModuleList'
import AddModule from './components/AddModule'
import SendPayment from './components/SendPayment'
import FiatPayment from './components/FiatPayment'
import Login from './components/Login'
import EmergencyPauseButton from './components/EmergencyPauseButton'
import ApiKeyManagement from './components/ApiKeyManagement'
import DisbursementManagement from './components/DisbursementManagement'
import WalletDashboard from './components/WalletDashboard'
import BlockchainModules from './components/BlockchainModules'
import DynamicNavigation from './components/DynamicNavigation'
import DynamicDashboard from './components/DynamicDashboard'
import CustomModuleBuilder from './components/CustomModuleBuilder'
import AddContractsToModule from './components/AddContractsToModule'
import { supabase } from './supabase'
import axios from 'axios'
import './App.css'

function App() {
  const [session, setSession] = useState(null)
  const [role, setRole] = useState('user')
  const [selectedModule, setSelectedModule] = useState(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [activeTab, setActiveTab] = useState('standard')
  const [showCustomModuleBuilder, setShowCustomModuleBuilder] = useState(false)
  const [showAddContracts, setShowAddContracts] = useState(false)
  const [selectedDynamicModule, setSelectedDynamicModule] = useState(null)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${session.access_token}`
        fetchUserRole(session.user.id)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${session.access_token}`
        fetchUserRole(session.user.id)
      } else {
        delete axios.defaults.headers.common['Authorization']
        setRole('user')
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchUserRole = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching role:', error)
        return
      }
      if (data) setRole(data.role)
    } catch (err) {
      console.error('Unexpected error fetching role:', err)
    }
  }



  const handleModuleAdded = (newModule) => {
    setRefreshTrigger(prev => prev + 1)
  }

  const handleSelectModule = (module) => {
    setSelectedModule(module)
  }

  const handleDynamicModuleSelect = (module) => {
    if (module.type === 'standard') {
      setActiveTab(module.tab)
      setSelectedDynamicModule(null)
    } else if (module.type === 'admin') {
      setActiveTab('admin')
      setSelectedDynamicModule(null)
    } else {
      setSelectedDynamicModule(module)
      setActiveTab('dynamic')
    }
  }

  const handleCustomModuleCreated = () => {
    setShowCustomModuleBuilder(false)
    setRefreshTrigger(prev => prev + 1)
  }

  const handleContractsAdded = () => {
    setShowAddContracts(false)
    setRefreshTrigger(prev => prev + 1)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setSession(null)
    setRole('user')
  }

  if (!session) {
    return <Login />
  }

  return (
    <div className="App">
      <header className="App-header">
        <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
          <span style={{ marginRight: '1rem', fontSize: '0.9rem' }}>{session.user.email} ({role})</span>
          <button onClick={handleLogout} style={{
            padding: '0.5rem 1rem',
            background: 'rgba(255,255,255,0.2)',
            border: '1px solid rgba(255,255,255,0.3)',
            color: 'white',
            borderRadius: '4px',
            cursor: 'pointer'
          }}>Logout</button>
        </div>

        {role === 'admin' && (
          <div style={{ position: 'absolute', top: '1rem', left: '1rem' }}>
            <EmergencyPauseButton scope="GLOBAL" label="GLOBAL SYSTEM" />
          </div>
        )}

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
            Fiat Gateway (USD/EUR/AUD/CAD/GBP)
          </button>
          {/* <button
            className={`tab-button ${activeTab === 'wallet' ? 'active' : ''}`}
            onClick={() => setActiveTab('wallet')}
            style={{
              padding: '1rem 2rem',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              background: activeTab === 'wallet' ? 'white' : 'rgba(255,255,255,0.2)',
              color: activeTab === 'wallet' ? '#764ba2' : 'white',
              fontWeight: 600,
              fontSize: '1.1rem',
              transition: 'all 0.3s'
            }}
          >
            💳 Wallet
          </button> */}

          <button
            className={`tab-button ${activeTab === 'blockchain' ? 'active' : ''}`}
            onClick={() => setActiveTab('blockchain')}
            style={{
              padding: '1rem 2rem',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              background: activeTab === 'blockchain' ? 'white' : 'rgba(255,255,255,0.2)',
              color: activeTab === 'blockchain' ? '#764ba2' : 'white',
              fontWeight: 600,
              fontSize: '1.1rem',
              transition: 'all 0.3s'
            }}
          >
            🔗 Blockchain
          </button>

          <button
            className={`tab-button ${activeTab === 'dynamic' ? 'active' : ''}`}
            onClick={() => setActiveTab('dynamic')}
            style={{
              padding: '1rem 2rem',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              background: activeTab === 'dynamic' ? 'white' : 'rgba(255,255,255,0.2)',
              color: activeTab === 'dynamic' ? '#764ba2' : 'white',
              fontWeight: 600,
              fontSize: '1.1rem',
              transition: 'all 0.3s'
            }}
          >
            🚀 Dynamic Modules
          </button>

          {(role === 'admin' || role === 'TREASURY' || role === 'COMPLIANCE') && (
            <button
              className={`tab-button ${activeTab === 'admin' ? 'active' : ''}`}
              onClick={() => setActiveTab('admin')}
              style={{
                padding: '1rem 2rem',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                background: activeTab === 'admin' ? 'white' : 'rgba(255,255,255,0.2)',
                color: activeTab === 'admin' ? '#764ba2' : 'white',
                fontWeight: 600,
                fontSize: '1.1rem',
                transition: 'all 0.3s'
              }}
            >
              Admin & RBAC
            </button>
          )}
        </div>


        {activeTab === 'standard' ? (
          <>
            <div className="modules-section">
              <div className="section-header">
                <h2>Payment Modules</h2>
                {role === 'admin' && <AddModule onModuleAdded={handleModuleAdded} />}
              </div>

              <ModuleList
                onSelectModule={handleSelectModule}
                selectedModuleId={selectedModule?.moduleId}
                refreshTrigger={refreshTrigger}
                role={role}
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
        ) : activeTab === 'fiat' ? (
          <div className="payment-section">
            <FiatPayment />
          </div>
        ) : activeTab === 'wallet' ? (
          <WalletDashboard session={session} />
        ) : activeTab === 'blockchain' ? (
          <BlockchainModules role={role} />
        ) : activeTab === 'dynamic' ? (
          <div style={{ padding: '2rem' }}>
            {selectedDynamicModule ? (
              <DynamicDashboard moduleId={selectedDynamicModule.moduleId} role={role} />
            ) : (
              <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '2rem'
                }}>
                  <div>
                    <h2 style={{ margin: 0, fontSize: '2rem', color: 'white' }}>
                      🚀 Dynamic Modules
                    </h2>
                    <p style={{ margin: '0.5rem 0 0 0', color: 'rgba(255,255,255,0.7)' }}>
                      Manage custom and dynamically registered modules
                    </p>
                  </div>
                  {role === 'admin' && (
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <button
                        onClick={() => setShowAddContracts(true)}
                        style={{
                          padding: '1rem 2rem',
                          background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '1rem',
                          fontWeight: 600,
                          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                        }}
                      >
                        + Add Contracts
                      </button>
                      <button
                        onClick={() => setShowCustomModuleBuilder(true)}
                        style={{
                          padding: '1rem 2rem',
                          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '1rem',
                          fontWeight: 600,
                          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                        }}
                      >
                        + Create Custom Module
                      </button>
                    </div>
                  )}
                </div>

                <DynamicNavigation
                  onModuleSelect={handleDynamicModuleSelect}
                  selectedModuleId={selectedDynamicModule?.moduleId}
                  role={role}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="admin-section" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <ApiKeyManagement />
            <DisbursementManagement role={role} />
          </div>
        )}
      </main>

      {/* Add Contracts Modal Overlay */}
      {showAddContracts && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '2rem',
          overflow: 'auto'
        }}>
          <div style={{
            maxWidth: '100%',
            maxHeight: '100%',
            overflow: 'auto'
          }}>
            <AddContractsToModule
              onSuccess={handleContractsAdded}
              onCancel={() => setShowAddContracts(false)}
            />
          </div>
        </div>
      )}

      {/* Custom Module Builder Modal Overlay */}
      {showCustomModuleBuilder && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '2rem',
          overflow: 'auto'
        }}>
          <div style={{
            maxWidth: '100%',
            maxHeight: '100%',
            overflow: 'auto'
          }}>
            <CustomModuleBuilder
              onSuccess={handleCustomModuleCreated}
              onCancel={() => setShowCustomModuleBuilder(false)}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default App

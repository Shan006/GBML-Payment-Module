import { useState, useEffect } from 'react'
import ModuleList from './components/ModuleList'
import AddModule from './components/AddModule'
import SendPayment from './components/SendPayment'
import FiatPayment from './components/FiatPayment'
import Login from './components/Login'
import { supabase } from './supabase'
import axios from 'axios'
import './App.css'

function App() {
  const [session, setSession] = useState(null)
  const [role, setRole] = useState('user')
  const [selectedModule, setSelectedModule] = useState(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [activeTab, setActiveTab] = useState('standard')

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
                {role === 'admin' && <AddModule onModuleAdded={handleModuleAdded} />}
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

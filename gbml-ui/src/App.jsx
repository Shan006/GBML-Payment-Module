import { useState, useEffect } from 'react'
import ModuleList from './components/ModuleList'
import AddModule from './components/AddModule'
import SendPayment from './components/SendPayment'
import './App.css'

function App() {
  const [selectedModule, setSelectedModule] = useState(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleModuleAdded = (newModule) => {
    // Trigger refresh of module list
    setRefreshTrigger(prev => prev + 1)
    // Optionally select the newly added module
    if (newModule.moduleId) {
      setTimeout(() => {
        // The ModuleList will refresh, so we need to select it after refresh
        // For now, just refresh the list
      }, 500)
    }
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
      </main>
    </div>
  )
}

export default App

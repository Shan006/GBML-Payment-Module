import { useState, useEffect } from 'react'
import axios from 'axios'

import { API_BASE_URL } from '../config'
import CreateWallet from './CreateWallet'
import WalletInfo from './WalletInfo'
import TokenBalances from './TokenBalances'
import SendTokens from './SendTokens'
import TransactionHistory from './TransactionHistory'

export default function WalletDashboard({ session }) {
  const [wallet, setWallet] = useState(null)
  const [loading, setLoading] = useState(true)
  const [hasWallet, setHasWallet] = useState(false)

  const fetchWallet = async () => {
    setLoading(true)

    try {
      const response = await axios.get(`${API_BASE_URL}/wallets/${session.user.id}`)
      setWallet(response.data)
      setHasWallet(true)
    } catch (err) {
      // 404 or any error means no wallet
      setWallet(null)
      setHasWallet(false)
      if (err.response?.status !== 404) {
        console.error('Error fetching wallet:', err)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session?.user?.id) {
      fetchWallet()
    }
  }, [session?.user?.id])

  if (loading) {
    return (
      <div className="wallet-dashboard">
        <div className="loading-spinner">Loading wallet...</div>
      </div>
    )
  }

  if (!hasWallet) {
    return (
      <div className="wallet-dashboard">
        <CreateWallet
          userId={session.user.id}
          onWalletCreated={fetchWallet}
        />
      </div>
    )
  }

  return (
    <div className="wallet-dashboard">
      <div className="dashboard-top">
        <WalletInfo walletAddress={wallet.walletAddress} />
      </div>

      <div className="dashboard-middle">
        <div className="dashboard-middle-left">
          <TokenBalances walletAddress={wallet.walletAddress} />
        </div>
        <div className="dashboard-middle-right">
          <SendTokens fromAddress={wallet.walletAddress} />
        </div>
      </div>

      <div className="dashboard-bottom">
        <TransactionHistory walletAddress={wallet.walletAddress} />
      </div>
    </div>
  )
}

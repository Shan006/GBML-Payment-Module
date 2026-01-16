import { useState, useEffect } from 'react'
import axios from 'axios'

import { API_BASE_URL } from '../config'

export default function EmergencyPauseButton({ scope, targetId, label }) {
    const [isPaused, setIsPaused] = useState(false)
    const [loading, setLoading] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [reason, setReason] = useState('')

    const checkStatus = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/admin/pause/status`, {
                params: { scope, targetId }
            })
            setIsPaused(response.data.isPaused)
        } catch (err) {
            console.error('Error checking pause status:', err)
        }
    }

    useEffect(() => {
        checkStatus()
    }, [scope, targetId])

    const handleToggle = async () => {
        setLoading(true)
        try {
            await axios.post(`${API_BASE_URL}/admin/pause`, {
                scope,
                targetId,
                isPaused: !isPaused,
                reason: reason || 'Admin manual trigger'
            })
            setIsPaused(!isPaused)
            setShowConfirm(false)
            setReason('')
        } catch (err) {
            alert('Failed to update pause state: ' + (err.response?.data?.message || err.message))
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="emergency-pause-container" style={{ display: 'inline-block' }}>
            {!showConfirm ? (
                <button
                    onClick={() => setShowConfirm(true)}
                    disabled={loading}
                    style={{
                        padding: '0.4rem 0.8rem',
                        background: isPaused ? '#2ecc71' : '#e74c3c',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: 'bold',
                        transition: 'all 0.3s'
                    }}
                >
                    {isPaused ? `Unpause ${label || scope}` : `Pause ${label || scope}`}
                </button>
            ) : (
                <div style={{
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    background: 'white',
                    padding: '1.5rem',
                    borderRadius: '8px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                    zIndex: 1000,
                    color: '#333',
                    minWidth: '300px'
                }}>
                    <h3 style={{ marginBottom: '1rem' }}>Confirm {isPaused ? 'Unpause' : 'Pause'}</h3>
                    <p style={{ marginBottom: '1rem' }}>Are you sure you want to {isPaused ? 'resume' : 'suspend'} operations for this {scope.toLowerCase()}?</p>

                    {!isPaused && (
                        <input
                            type="text"
                            placeholder="Reason for pause..."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.5rem',
                                marginBottom: '1rem',
                                borderRadius: '4px',
                                border: '1px solid #ddd'
                            }}
                        />
                    )}

                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button
                            onClick={() => setShowConfirm(false)}
                            style={{ padding: '0.5rem 1rem', border: 'none', background: '#eee', borderRadius: '4px', cursor: 'pointer' }}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleToggle}
                            disabled={loading}
                            style={{
                                padding: '0.5rem 1rem',
                                border: 'none',
                                background: isPaused ? '#2ecc71' : '#e74c3c',
                                color: 'white',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                        >
                            {loading ? 'Processing...' : `Confirm ${isPaused ? 'Unpause' : 'Pause'}`}
                        </button>
                    </div>
                </div>
            )}
            {showConfirm && <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0,0,0,0.5)',
                zIndex: 999
            }} onClick={() => setShowConfirm(false)} />}
        </div>
    )
}

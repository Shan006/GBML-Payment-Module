import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL, TENANT_ID } from '../config'

const DisbursementManagement = ({ role }) => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [executingId, setExecutingId] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/disbursements`);
            setRequests(response.data.data);
        } catch (err) {
            setError('Failed to fetch disbursement requests');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleExecute = async (requestId) => {
        setExecutingId(requestId);
        setError(null);
        try {
            await axios.post(`${API_BASE_URL}/treasury/disbursements/${requestId}/execute`);
            alert('Disbursement executed successfully!');
            fetchRequests();
        } catch (err) {
            setError(err.response?.data?.error || 'Execution failed');
        } finally {
            setExecutingId(null);
        }
    };

    return (
        <div className="disbursement-management card">
            <h2>Disbursement Requests</h2>

            {error && <div className="error-message">{error}</div>}

            <div className="requests-list">
                {requests.length === 0 ? <p>No disbursement requests found.</p> : (
                    <table>
                        <thead>
                            <tr>
                                <th>Recipient</th>
                                <th>Amount</th>
                                <th>Token</th>
                                <th>Status</th>
                                <th>Reason</th>
                                <th>Requested At</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requests.map(req => (
                                <tr key={req.id}>
                                    <td><code>{req.recipient_address.substring(0, 10)}...</code></td>
                                    <td>{req.amount}</td>
                                    <td><code>{req.token_address.substring(0, 10)}...</code></td>
                                    <td className={`status-${req.status.toLowerCase()}`}>{req.status}</td>
                                    <td>{req.reason || '-'}</td>
                                    <td>{new Date(req.created_at).toLocaleString()}</td>
                                    <td>
                                        {(req.status === 'PENDING' || req.status === 'PROCESSING' || req.status === 'APPROVED') && (role === 'admin' || role === 'TREASURY') && (
                                            <button
                                                onClick={() => handleExecute(req.id)}
                                                disabled={loading || executingId === req.id || req.status === 'PROCESSING'}
                                                className={`btn-execute ${req.status === 'PROCESSING' ? 'btn-processing' : ''}`}
                                            >
                                                {executingId === req.id || req.status === 'PROCESSING' ? 'Processing...' : 'Execute'}
                                            </button>
                                        )}
                                        {req.blockchain_tx_hash && (
                                            <a
                                                href={`https://explorer.jvdegcr.com/tx/${req.blockchain_tx_hash}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="tx-link"
                                            >View Tx</a>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <button onClick={fetchRequests} disabled={loading} className="btn-refresh">
                Refresh List
            </button>
        </div>
    );
};

export default DisbursementManagement;

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/gbml';

const ApiKeyManagement = () => {
    const [keys, setKeys] = useState([]);
    const [loading, setLoading] = useState(false);
    const [newKeyData, setNewKeyData] = useState({ name: '', roles: ['PROGRAM'], tenantId: 'default' });
    const [generatedKey, setGeneratedKey] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchKeys();
    }, []);

    const fetchKeys = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/admin/api-keys`, {
                params: { tenantId: 'default' }
            });
            setKeys(response.data.data);
        } catch (err) {
            setError('Failed to fetch API keys');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateKey = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const response = await axios.post(`${API_BASE_URL}/admin/api-keys`, newKeyData);
            setGeneratedKey(response.data.data.rawKey);
            fetchKeys();
            setNewKeyData({ name: '', roles: ['PROGRAM'], tenantId: 'default' });
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create API key');
        } finally {
            setLoading(false);
        }
    };

    const handleRevokeKey = async (id) => {
        if (!window.confirm('Are you sure you want to revoke this API key?')) return;
        setLoading(true);
        try {
            await axios.delete(`${API_BASE_URL}/admin/api-keys/${id}`);
            fetchKeys();
        } catch (err) {
            setError('Failed to revoke API key');
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = (role) => {
        const currentRoles = [...newKeyData.roles];
        if (currentRoles.includes(role)) {
            setNewKeyData({ ...newKeyData, roles: currentRoles.filter(r => r !== role) });
        } else {
            setNewKeyData({ ...newKeyData, roles: [...currentRoles, role] });
        }
    };

    return (
        <div className="api-key-management card">
            <h2>API Key Management</h2>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleCreateKey} className="create-key-form">
                <div className="form-group">
                    <label>Key Name:</label>
                    <input
                        type="text"
                        value={newKeyData.name}
                        onChange={(e) => setNewKeyData({ ...newKeyData, name: e.target.value })}
                        placeholder="e.g. Treasury Bot"
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Roles:</label>
                    <div className="roles-checkboxes">
                        {/* {['PROGRAM', 'TREASURY', 'COMPLIANCE'].map(role => (
                            <label key={role} className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={newKeyData.roles.includes(role)}
                                    onChange={() => handleRoleChange(role)}
                                /> {role}
                            </label>
                        ))} */}
                        {['PROGRAM'].map(role => (
                            <label key={role} className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={newKeyData.roles.includes(role)}
                                    onChange={() => handleRoleChange(role)}
                                /> {role}
                            </label>
                        ))}
                    </div>
                </div>
                <button type="submit" disabled={loading || newKeyData.roles.length === 0}>
                    {loading ? 'Generating...' : 'Generate New API Key'}
                </button>
            </form>

            {generatedKey && (
                <div className="generated-key-alert">
                    <p><strong>IMPORTANT:</strong> Copy this key now. It will not be shown again!</p>
                    <code>{generatedKey}</code>
                    <button onClick={() => setGeneratedKey(null)}>Dismiss</button>
                </div>
            )}

            <div className="keys-list">
                <h3>Active Keys</h3>
                {keys.length === 0 ? <p>No API keys found.</p> : (
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Prefix</th>
                                <th>Roles</th>
                                <th>Status</th>
                                <th>Created</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {keys.map(key => (
                                <tr key={key.id} className={!key.is_active ? 'revoked' : ''}>
                                    <td>{key.name}</td>
                                    <td><code>{key.key_prefix}...</code></td>
                                    <td>{key.roles.join(', ')}</td>
                                    <td>{key.is_active ? 'Active' : 'Revoked'}</td>
                                    <td>{new Date(key.created_at).toLocaleDateString()}</td>
                                    <td>
                                        {key.is_active && (
                                            <button
                                                onClick={() => handleRevokeKey(key.id)}
                                                className="btn-revoke"
                                            >Revoke</button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default ApiKeyManagement;

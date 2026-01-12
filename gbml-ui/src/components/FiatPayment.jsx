import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
    Elements,
    PaymentElement,
    useStripe,
    useElements,
} from '@stripe/react-stripe-js';
import axios from 'axios';

// Initialize Stripe (use a placeholder key if not provided in env)
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');

const CheckoutForm = ({ clientSecret, onPaymentSuccess, onPaymentError, fiatAmount, currency, tokenSymbol }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!stripe || !elements) return;

        setIsProcessing(true);
        setErrorMessage(null);

        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            redirect: 'if_required',
        });

        if (error) {
            setErrorMessage(error.message);
            onPaymentError(error.message);
        } else if (paymentIntent && paymentIntent.status === 'succeeded') {
            onPaymentSuccess(paymentIntent);
        }

        setIsProcessing(false);
    };

    return (
        <form onSubmit={handleSubmit} id="payment-form">
            <div className="payment-intent-summary">
                <p>Paying <strong>{fiatAmount} {currency}</strong> for <strong>{tokenSymbol}</strong> tokens</p>
            </div>

            <PaymentElement id="payment-element" />

            <button
                disabled={isProcessing || !stripe || !elements}
                id="submit"
                className="submit-button"
                style={{ marginTop: '1.5rem' }}
            >
                <span id="button-text">
                    {isProcessing ? "Processing..." : `Pay ${fiatAmount} ${currency}`}
                </span>
            </button>

            {errorMessage && <div className="error-message">{errorMessage}</div>}
        </form>
    );
};

const FiatPayment = () => {
    const [tokens, setTokens] = useState([]);
    const [selectedToken, setSelectedToken] = useState('');
    const [currency, setCurrency] = useState('USD');
    const [amount, setAmount] = useState('');
    const [recipientAddress, setRecipientAddress] = useState('');
    const [clientSecret, setClientSecret] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successData, setSuccessData] = useState(null);
    const [backendStatus, setBackendStatus] = useState(null);

    const API_BASE_URL = 'http://localhost:3000/gbml';

    useEffect(() => {
        fetchTokens();
    }, []);

    const fetchTokens = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/tokens`);
            setTokens(response.data.tokens || []);
            if (response.data.tokens?.length > 0) {
                setSelectedToken(response.data.tokens[0].symbol);
            }
        } catch (err) {
            console.error('Error fetching tokens:', err);
            setError('Failed to load available tokens');
        }
    };

    const handleInitPayment = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccessData(null);
        setBackendStatus(null);

        try {
            const response = await axios.post(`${API_BASE_URL}/fiat/payment/create`, {
                token: selectedToken,
                currency,
                amount,
                recipientAddress,
            });

            setClientSecret(response.data.clientSecret);
        } catch (err) {
            console.error('Error creating payment intent:', err);
            setError(err.response?.data?.error || 'Failed to initialize payment');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePaymentSuccess = async (paymentIntent) => {
        setSuccessData(paymentIntent);
        setClientSecret(null); // Close the form

        // Periodically check backend status for the blockchain transaction
        checkBackendStatus(paymentIntent.id);
    };

    const checkBackendStatus = async (paymentIntentId) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/fiat/transaction/${paymentIntentId}`);
            setBackendStatus(response.data);

            if (response.data.status === 'pending') {
                setTimeout(() => checkBackendStatus(paymentIntentId), 3000);
            }
        } catch (err) {
            console.error('Error checking backend status:', err);
        }
    };

    const handlePaymentError = (msg) => {
        setError(msg);
    };

    const resetForm = () => {
        setClientSecret(null);
        setSuccessData(null);
        setBackendStatus(null);
        setAmount('');
        setRecipientAddress('');
        setError(null);
    };

    return (
        <div className="fiat-payment send-payment">
            <h2>Multi-Currency Gateway</h2>
            <p>Convert fiat (USD/EUR) to JRC-20 tokens via Stripe</p>

            {successData ? (
                <div className="success-message">
                    <h3>Payment Successful!</h3>
                    <p>Stripe Payment ID: <strong>{successData.id}</strong></p>
                    <p>Amount: <strong>{amount} {currency}</strong></p>

                    {backendStatus ? (
                        <div className="blockchain-status" style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.5)', borderRadius: '8px' }}>
                            <h4>Blockchain Status: {backendStatus.status.toUpperCase()}</h4>
                            {backendStatus.blockchainTxHash && (
                                <p>Transaction Hash: <br />
                                    <a href={`#`} target="_blank" rel="noreferrer" className="token-address" style={{ display: 'inline-block', marginTop: '5px' }}>
                                        {backendStatus.blockchainTxHash}
                                    </a>
                                </p>
                            )}
                            {backendStatus.tokenAmount && (
                                <p>Tokens Transferred: <strong>{backendStatus.tokenAmount} {selectedToken}</strong></p>
                            )}
                            {backendStatus.status === 'pending' && <p>Processing on-chain transaction... please wait.</p>}
                        </div>
                    ) : (
                        <p>Processing on-chain transaction...</p>
                    )}

                    <button onClick={resetForm} className="cancel-button" style={{ marginTop: '1.5rem' }}>
                        New Payment
                    </button>
                </div>
            ) : clientSecret ? (
                <div className="stripe-checkout-container">
                    <div className="checkout-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <h3>Complete Payment</h3>
                        <button onClick={() => setClientSecret(null)} className="refresh-button">Back</button>
                    </div>
                    <Elements stripe={stripePromise} options={{ clientSecret }}>
                        <CheckoutForm
                            clientSecret={clientSecret}
                            onPaymentSuccess={handlePaymentSuccess}
                            onPaymentError={handlePaymentError}
                            fiatAmount={amount}
                            currency={currency}
                            tokenSymbol={selectedToken}
                        />
                    </Elements>
                </div>
            ) : (
                <form onSubmit={handleInitPayment}>
                    <div className="form-group">
                        <label>Select Token</label>
                        <select
                            value={selectedToken}
                            onChange={(e) => setSelectedToken(e.target.value)}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '2px solid #e0e0e0' }}
                            disabled={isLoading}
                        >
                            {tokens.map(token => (
                                <option key={token.symbol} value={token.symbol}>
                                    {token.name} ({token.symbol})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-row" style={{ display: 'flex', gap: '1rem' }}>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label>Currency</label>
                            <select
                                value={currency}
                                onChange={(e) => setCurrency(e.target.value)}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '2px solid #e0e0e0' }}
                                disabled={isLoading}
                            >
                                <option value="USD">USD ($)</option>
                                <option value="EUR">EUR (€)</option>
                            </select>
                        </div>
                        <div className="form-group" style={{ flex: 2 }}>
                            <label>Amount</label>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.00"
                                step="0.01"
                                required
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Recipient Blockchain Address</label>
                        <input
                            type="text"
                            value={recipientAddress}
                            onChange={(e) => setRecipientAddress(e.target.value)}
                            placeholder="0x..."
                            required
                            disabled={isLoading}
                        />
                        <small>Tokens will be sent to this address on successfully payment</small>
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <button type="submit" className="submit-button" disabled={isLoading || !selectedToken}>
                        {isLoading ? 'Initializing...' : 'Continue to Payment'}
                    </button>
                </form>
            )}
        </div>
    );
};

export default FiatPayment;

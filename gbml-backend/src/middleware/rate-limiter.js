import rateLimit from 'express-rate-limit';

const walletRequests = new Map();

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again later.' }
});

export const deployLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many deployment requests from this IP. Try again later.' }
});

export function walletRateLimiter(req, res, next) {
  const wallet = req.body?.fromWallet || req.body?.moduleId || req.ip;
  if (!wallet) return next();

  const now = Date.now();
  const record = walletRequests.get(wallet) || { count: 0, last: now };

  if (now - record.last < 5 * 60 * 1000) {
    if (record.count >= 3) {
      return res.status(429).json({ error: 'Rate limit exceeded for this wallet/module.' });
    }
    record.count += 1;
  } else {
    record.count = 1;
    record.last = now;
  }

  walletRequests.set(wallet, record);
  next();
}

export function cleanupWalletRateLimits() {
  const cutoff = Date.now() - 30 * 60 * 1000;
  for (const [key, record] of walletRequests.entries()) {
    if (record.last < cutoff) walletRequests.delete(key);
  }
}

setInterval(cleanupWalletRateLimits, 10 * 60 * 1000);

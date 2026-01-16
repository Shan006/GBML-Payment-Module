const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/gbml'

// Ensure API_BASE_URL starts with a protocol
export const API_BASE_URL = rawApiBaseUrl.startsWith('http')
    ? rawApiBaseUrl
    : `https://${rawApiBaseUrl}`

export const TENANT_ID = 'tenant-001' // In production, this would come from auth context

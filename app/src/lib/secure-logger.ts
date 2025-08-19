/**
 * Security-aware logging utilities
 * Prevents sensitive data from being logged in production
 */

const isProduction = process.env.NODE_ENV === 'production';

// List of sensitive keys that should never be logged
const SENSITIVE_KEYS = [
  'password', 'token', 'secret', 'key', 'authorization', 'auth',
  'email', 'phone', 'ssn', 'credit', 'card', 'cvv', 'pin',
  'api_key', 'private_key', 'client_secret'
];

/**
 * Sanitizes an object by removing or masking sensitive fields
 */
function sanitizeObject(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;
  
  const sanitized = { ...obj };
  
  for (const key in sanitized) {
    const lowerKey = key.toLowerCase();
    
    if (SENSITIVE_KEYS.some(sensitive => lowerKey.includes(sensitive))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof sanitized[key] === 'object') {
      sanitized[key] = sanitizeObject(sanitized[key]);
    }
  }
  
  return sanitized;
}

/**
 * Safe console.log that sanitizes sensitive data
 */
export function safeLog(message: string, data?: any) {
  if (isProduction) {
    // In production, only log the message without data
    console.log(message);
  } else {
    // In development, log sanitized data
    if (data) {
      console.log(message, sanitizeObject(data));
    } else {
      console.log(message);
    }
  }
}

/**
 * Safe console.error that sanitizes sensitive data
 */
export function safeError(message: string, error?: any) {
  if (isProduction) {
    // In production, log error message but sanitize details
    console.error(message, error?.message || error);
  } else {
    // In development, log full sanitized error
    console.error(message, sanitizeObject(error));
  }
}

/**
 * Safe console.warn that sanitizes sensitive data
 */
export function safeWarn(message: string, data?: any) {
  if (isProduction) {
    console.warn(message);
  } else {
    if (data) {
      console.warn(message, sanitizeObject(data));
    } else {
      console.warn(message);
    }
  }
}

export default {
  log: safeLog,
  error: safeError,
  warn: safeWarn
};

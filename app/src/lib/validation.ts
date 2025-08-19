/**
 * Input validation and sanitization utilities
 */
import { NextRequest } from 'next/server';

export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Validates email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates UUID format
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Sanitizes string input by removing potentially dangerous characters
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/[<>\"']/g, '') // Remove HTML-related characters
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .trim();
}

/**
 * Validates request body against a schema
 */
export function validateRequestBody<T>(
  body: any,
  requiredFields: (keyof T)[],
  optionalFields: (keyof T)[] = []
): { isValid: boolean; errors: ValidationError[]; data?: T } {
  const errors: ValidationError[] = [];
  
  if (!body || typeof body !== 'object') {
    return {
      isValid: false,
      errors: [{ field: 'body', message: 'Request body must be a valid JSON object' }]
    };
  }

  // Check required fields
  for (const field of requiredFields) {
    if (!(field in body) || body[field] === null || body[field] === undefined) {
      errors.push({
        field: String(field),
        message: `Field '${String(field)}' is required`
      });
    }
  }

  // Check for unexpected fields
  const allowedFields = [...requiredFields, ...optionalFields];
  for (const field in body) {
    if (!allowedFields.includes(field as keyof T)) {
      errors.push({
        field,
        message: `Unexpected field '${field}'`
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: errors.length === 0 ? body as T : undefined
  };
}

/**
 * Rate limiting check (simple in-memory implementation)
 * In production, use Redis or similar
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  identifier: string,
  maxRequests: number = 100,
  windowMs: number = 15 * 60 * 1000 // 15 minutes
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetTime) {
    // Reset or create new record
    const resetTime = now + windowMs;
    rateLimitMap.set(identifier, { count: 1, resetTime });
    return { allowed: true, remaining: maxRequests - 1, resetTime };
  }

  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetTime: record.resetTime };
  }

  // Increment count
  record.count++;
  rateLimitMap.set(identifier, record);
  
  return { 
    allowed: true, 
    remaining: maxRequests - record.count, 
    resetTime: record.resetTime 
  };
}

/**
 * Extracts client IP address from request
 */
export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const real = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (real) {
    return real.trim();
  }
  
  return 'unknown';
}

/**
 * Validates Authorization header and extracts token
 */
export function extractBearerToken(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authHeader.substring(7);
  return token.length > 0 ? token : null;
}

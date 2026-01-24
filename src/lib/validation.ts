import { z } from 'zod';

// Phone number validation schema - Egyptian format
export const phoneSchema = z
  .string()
  .trim()
  .regex(/^01[0-9]{9}$/, {
    message: 'رقم التليفون لازم يبدأ بـ 01 ويكون 11 رقم',
  });

// Validate phone number and return result
export const validatePhone = (phone: string): { valid: boolean; error?: string; sanitized?: string } => {
  // Remove all non-digit characters for sanitization
  const sanitized = phone.replace(/\D/g, '');
  
  const result = phoneSchema.safeParse(sanitized);
  
  if (result.success) {
    return { valid: true, sanitized: result.data };
  }
  
  return { valid: false, error: result.error.errors[0]?.message || 'رقم غير صالح' };
};

// Sanitize phone before storage - only store digits
export const sanitizePhoneForStorage = (phone: string): string => {
  return phone.replace(/\D/g, '').slice(0, 11);
};

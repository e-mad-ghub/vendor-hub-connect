import { z } from 'zod';

// Phone number validation schema - accepts +20 or 01 prefixes
export const phoneSchema = z
  .string()
  .trim()
  .refine((value) => {
    const digitsOnly = value.replace(/\D/g, '');
    return digitsOnly.length >= 10 && (digitsOnly.startsWith('01') || digitsOnly.startsWith('20'));
  }, {
    message: 'رقم التليفون لازم يبدأ بـ +20 أو 01 ويكون على الأقل 10 أرقام',
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
  return phone.replace(/\D/g, '').slice(0, 15);
};

// Sanitize user input while keeping a single leading "+"
export const sanitizePhoneInput = (value: string): string => {
  let next = value.replace(/[^\d+]/g, '');
  if (next.startsWith('+')) {
    next = `+${next.slice(1).replace(/\+/g, '')}`;
  } else {
    next = next.replace(/\+/g, '');
  }
  return next.slice(0, 16);
};

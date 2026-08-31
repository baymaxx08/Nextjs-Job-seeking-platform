import { z } from 'zod';

const passwordSchema = z.string().min(8, 'Password must be at least 8 characters long').max(128);

const optionalText = (maxLength) =>
  z.preprocess((value) => {
    if (typeof value !== 'string') {
      return undefined;
    }

    const trimmed = value.trim();
    return trimmed.length ? trimmed : undefined;
  }, z.string().max(maxLength).optional());

const loginSchema = z.object({
  role: z.enum(['seeker', 'provider']),
  email: z.string().email('Enter a valid email address').trim().toLowerCase(),
  password: passwordSchema,
});

const registerSeekerSchema = z
  .object({
    fullName: z.string().trim().min(2, 'Full name is required'),
    email: z.string().email('Enter a valid email address').trim().toLowerCase(),
    password: passwordSchema,
    confirmPassword: z.string().min(8, 'Confirm your password'),
    headline: optionalText(160),
    location: optionalText(120),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

const registerProviderSchema = z
  .object({
    companyName: z.string().trim().min(2, 'Company name is required'),
    email: z.string().email('Enter a valid email address').trim().toLowerCase(),
    password: passwordSchema,
    confirmPassword: z.string().min(8, 'Confirm your password'),
    industry: optionalText(120),
    location: optionalText(120),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export {
  optionalText,
  loginSchema,
  registerSeekerSchema,
  registerProviderSchema,
};
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().trim().email().transform((email) => email.toLowerCase()),
  password: z.string().min(1).max(72).refine((password) => Buffer.byteLength(password, 'utf8') <= 72),
});

export const emailRecipientSchema = z.object({
  stage: z.number().int().min(1).max(18),
  department: z.enum(['Procurement', 'Logistics', 'Finance', 'BAG', 'ChiefRM']),
  type: z.enum(['To', 'CC']),
  name: z.string().trim().max(100).optional(),
  email: z.string().trim().email().transform((email) => email.toLowerCase()),
  active: z.boolean().default(true),
});

export const emailRecipientUpdateSchema = emailRecipientSchema.partial()
  .refine((value) => Object.keys(value).length > 0, 'Provide at least one field to update');

export const mineSchema = z.object({
  name: z.string().trim().min(1).max(150),
  area: z.string().trim().max(100).optional(),
  company: z.enum(['MCL', 'CCL', 'SECL', 'WCL', 'ECL']),
  active: z.boolean().default(true),
});

export const mineUpdateSchema = mineSchema.partial()
  .refine((value) => Object.keys(value).length > 0, 'Provide at least one field to update');

export const quantitySchema = z.object({
  qty: z.number().int().positive(),
});

export function validate(schema) {
  return (request, response, next) => {
    const result = schema.safeParse(request.body);
    if (!result.success) {
      return response.status(400).json({
        error: 'Validation failed',
        details: result.error.issues.map((issue) => ({ path: issue.path.join('.'), message: issue.message })),
      });
    }
    request.body = result.data;
    next();
  };
}
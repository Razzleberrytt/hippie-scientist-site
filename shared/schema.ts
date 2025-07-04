import { z } from "zod";

// Product schema
export const productSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  price: z.number(),
  category: z.enum(["enhanced-gummies", "cannadelics", "silly-dots"]),
  features: z.array(z.string()),
  image: z.string(),
  potency: z.string(),
  quantity: z.number(),
  inStock: z.boolean(),
});

export type Product = z.infer<typeof productSchema>;

// Review schema
export const reviewSchema = z.object({
  id: z.string(),
  customerName: z.string(),
  rating: z.number().min(1).max(5),
  comment: z.string(),
  date: z.string(),
  productId: z.string(),
  verified: z.boolean(),
});

export type Review = z.infer<typeof reviewSchema>;

// FAQ schema
export const faqSchema = z.object({
  id: z.string(),
  question: z.string(),
  answer: z.string(),
  order: z.number(),
});

export type FAQ = z.infer<typeof faqSchema>;

// Newsletter subscription schema
export const newsletterSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  subscribedAt: z.string(),
});

export type Newsletter = z.infer<typeof newsletterSchema>;

// Contact form schema
export const contactSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  subject: z.string(),
  message: z.string(),
  submittedAt: z.string(),
});

export type Contact = z.infer<typeof contactSchema>;

// Insert schemas
export const insertProductSchema = productSchema.omit({ id: true });
export const insertReviewSchema = reviewSchema.omit({ id: true });
export const insertFAQSchema = faqSchema.omit({ id: true });
export const insertNewsletterSchema = newsletterSchema.omit({ id: true, subscribedAt: true });
export const insertContactSchema = contactSchema.omit({ id: true, submittedAt: true });

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type InsertFAQ = z.infer<typeof insertFAQSchema>;
export type InsertNewsletter = z.infer<typeof insertNewsletterSchema>;
export type InsertContact = z.infer<typeof insertContactSchema>;

import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_FORM_ENDPOINT: z.string().url(),
  NEXT_PUBLIC_ENABLE_ANALYTICS_ROUTE: z.enum(["true", "false"]),
  NEXT_PUBLIC_ENV: z.string().optional(),
  NEXT_PUBLIC_BASE_PATH: z.string().optional(),

  HERB_XLSX_PATH: z.string().optional(),
  SITEMAP_MAX_ROUTES: z.string().optional(),
  SITEMAP_CHUNK_SIZE: z.string().optional(),

  OPENAI_API_KEY: z.string().optional(),
  LLM_API_URL: z.string().optional(),
  LLM_API_KEY: z.string().optional(),
  LLM_MODEL: z.string().optional(),
  OPENAI_MODEL: z.string().optional(),

  AMAZON_AFFILIATE_TAG: z.string().optional(),

  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

export const env = envSchema.parse(process.env);

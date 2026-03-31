import { z } from "zod";

const envSchema = z.object({
  GOOGLE_SHEETS_ID: z.string().min(1),
  GOOGLE_SERVICE_ACCOUNT_EMAIL: z.string().email(),
  GOOGLE_PRIVATE_KEY: z.string().min(1)
});

export function getEnv() {
  return envSchema.parse({
    GOOGLE_SHEETS_ID: process.env.GOOGLE_SHEETS_ID,
    GOOGLE_SERVICE_ACCOUNT_EMAIL: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    GOOGLE_PRIVATE_KEY: process.env.GOOGLE_PRIVATE_KEY
  });
}

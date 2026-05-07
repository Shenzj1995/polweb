import { CustomerPortal } from "@dodopayments/nextjs";

const environment = process.env.DODO_PAYMENTS_ENVIRONMENT as "test_mode" | "live_mode" | undefined;

export const GET = CustomerPortal({
  bearerToken: process.env.DODO_PAYMENTS_API_KEY,
  environment,
});

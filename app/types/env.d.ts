export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_BASE_URL: string;
      GITLAB_WEBHOOK_SECRET: string;
      DISCORD_WEBHOOK_URL?: string;
      /** How long a report lives after it is received, in seconds (default 3600). */
      REPORT_TTL_SECONDS?: string;
    }
  }
}
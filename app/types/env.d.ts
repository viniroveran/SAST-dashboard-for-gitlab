export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_BASE_URL: string;
      GITLAB_WEBHOOK_SECRET: string;
      DISCORD_WEBHOOK_URL?: string;
    }
  }
}
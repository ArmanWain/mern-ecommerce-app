import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from "@sentry/profiling-node";

const sentryInit = () => {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    integrations: [
      nodeProfilingIntegration(),
    ],
    tracesSampleRate: 1.0,
    profilesSampleRate: 1.0,
  });
}

export default sentryInit;

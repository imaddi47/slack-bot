import pkg from '@slack/bolt';
const { App, ExpressReceiver } = pkg;
import dotenv from 'dotenv';
import registerCommandHandlers from './commands/__index.js';
import registerEventHandlers from './events/__index.js';
import registerInteractiveHandlers from './interactives/__index.js';

dotenv.config();

// define custom endpoints for Slack to interact with
const receiver = new ExpressReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  endpoints: {
    commands: '/slack/commands', // Slack will POST here for slash commands
    events: '/slack/events', // events endpoint (default)
    interactive: '/slack/interactive', // button press etc.
  },
});

// initialize your app with the receiver
const app = new App({
  token: process.env.SLACK_OAUTH_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  // logLevel: 'debug',
  ...(process.env.SOCKET_MODE == 'true'
    ? { socketMode: true, appToken: process.env.SLACK_APP_TOKEN }
    : { receiver }),
});

// register handlers
await registerCommandHandlers(app);
await registerEventHandlers(app);
await registerInteractiveHandlers(app);

// Start the app server
(async () => {
  try {
    const PORT = process.env.PORT || 3000;
    await app.start(PORT);
    console.log(`⚡️ Slack bot is running on port ${PORT}!`);
  } catch (error) {
    console.error('Failed to start app:', error);
    process.exit(1);
  }
})();

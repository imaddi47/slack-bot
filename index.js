import { App } from '@slack/bolt';
import dotenv from 'dotenv';

dotenv.config();

const app = new App({
    token: process.env.SLACK_OAUTH_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    // logLevel: 'debug',
});

app.event("app_mention", async ({ event, client }) => {
  await client(`👋 Hey <@${event.user}>! You mentioned me.`);
});

app.event("message", async ({ event, client }) => {
  if (event.subtype === 'bot_message' || !event.text) return;

  if (event.text.toLowerCase().includes("assistant")) {
    console.log('Assistant mentioned in message:', event.text);
    await client(`You said my name, <@${event.user}>?`);
  }

  if (event.text.toLowerCase().includes("thread mode")) {
    console.log('Thread mode mentioned in message:', event.text);
    await client.chat.postMessage({
      channel: event.channel,
      thread_ts: event.ts,
      text: `Thread mode activated, <@${event.user}>!`,
    });
  }
});

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
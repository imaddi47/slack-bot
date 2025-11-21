import pkg from '@slack/bolt';
const { App, ExpressReceiver } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const receiver = new ExpressReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  endpoints: {
    commands: '/slack/commands', // Slack will POST here for slash commands
    events: '/slack/events',     // events endpoint (default)
    interactive: '/slack/interactive' // optional
  }
});

const app = new App({
    token: process.env.SLACK_OAUTH_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    receiver
    // logLevel: 'debug',
});

app.event("app_mention", async ({event, say}) => {
  // const userInfo = await app.client.users.info({user: event.user})
  // console.log("[INFO] UserInfo :: ", userInfo);
  const threadTs = event.thread_ts || event.ts;
  await say({
    text: `Hey <@${event.user}>! I can help you with some commands.`,
    thread_ts: threadTs,
    blocks: [
      {
        type: 'section',
        text: { type: 'mrkdwn', text: `👋 Hey <@${event.user}>!` }
      },
      {
        type: 'section',
        text: { type: 'mrkdwn', text: '*I can help you with the following commands:*' }
      },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: '*• Command 1*\nShort description' },
          { type: 'mrkdwn', text: '*• Command 2*\nShort description' }
        ]
      }
    ]
  });
});

// Global Handle all message
app.event("message", async ({ event, client, say }) => {
  if (event.subtype === 'bot_message' || !event.text) return;

  console.log("[INFO]", event);

  if (event.text.toLowerCase().includes("assistant")) {
    console.log('Assistant mentioned in message:', event.text);
    await say(`You said my name, <@${event.user}>?`);
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

// Simple slash command that replies ephemerally
app.command('/i-ask', async ({ command, ack, respond, client }) => {
  await ack(); // acknowledge immediately
  // quick ephemeral reply to the user who invoked the command
  await respond({
    response_type: 'ephemeral',
    text: `Thanks <@${command.user_id}> — I received: "${command.text || '(no text)'}"`,
  });

  // optionally open a modal to collect more information
  // await client.views.open({
  //   trigger_id: command.trigger_id,
  //   view: {
  //     type: 'modal',
  //     callback_id: 'ask_modal',
  //     title: { type: 'plain_text', text: 'More details' },
  //     submit: { type: 'plain_text', text: 'Send' },
  //     blocks: [
  //       { type: 'input', block_id: 'q', label: { type: 'plain_text', text: 'Question' }, element: { type: 'plain_text_input', action_id: 'question', initial_value: command.text || '' } }
  //     ]
  //   }
  // });
});




// Interactive without actual interactive feature
app.event("message", async ({ event, client }) => {
  if (event.subtype === 'bot_message' || !event.text) return;

  if (event.text.toLowerCase().includes("ask approval")) {
    console.log('Approval request:', event.text);
    
    // post a message with interactive blocks (buttons + dropdown list)
    await client.chat.postMessage({
      channel: event.channel,
      thread_ts: event.thread_ts || event.ts,
      text: `Approval needed from <@${event.user}>`,
      blocks: [
        {
          type: 'section',
          text: { type: 'mrkdwn', text: `Please review and approve:\n\`\`\`${event.text}\`\`\`` }
        },
        {
          type: 'section',
          block_id: 'priority_block',
          text: { type: 'mrkdwn', text: '*Select Priority:*' },
          accessory: {
            type: 'static_select',
            action_id: 'priority_select',
            options: [
              { text: { type: 'plain_text', text: '🔴 High' }, value: 'high' },
              { text: { type: 'plain_text', text: '🟡 Medium' }, value: 'medium' },
              { text: { type: 'plain_text', text: '🟢 Low' }, value: 'low' }
            ],
            placeholder: { type: 'plain_text', text: 'Choose priority' }
          }
        },
        {
          type: 'input',
          block_id: 'approval_input',
          label: { type: 'plain_text', text: 'Your feedback' },
          element: {
            type: 'plain_text_input',
            action_id: 'feedback_text',
            placeholder: { type: 'plain_text', text: 'Enter feedback (optional)' },
            multiline: true
          }
        },
        {
          type: 'actions',
          block_id: 'approval_actions',
          elements: [
            {
              type: 'button',
              text: { type: 'plain_text', text: '✅ Accept' },
              action_id: 'approve_btn',
              value: event.user,
              style: 'primary'
            },
            {
              type: 'button',
              text: { type: 'plain_text', text: '❌ Reject' },
              action_id: 'reject_btn',
              value: event.user,
              style: 'danger'
            }
          ]
        }
      ]
    });
  }
});

// handle dropdown selection
app.action('priority_select', async ({ ack, body, client }) => {
  await ack();
  const selectedPriority = body.actions[0].selected_option.value;
  console.log(`Priority selected: ${selectedPriority}`);
  // you can store this value or use it later when approve/reject is clicked
});

// handle button clicks — update message to disable interactions
app.action('approve_btn', async ({ ack, body, client }) => {
  await ack();
  const user = body.user.id;
  const feedback = body.state?.values?.approval_input?.feedback_text?.value || '(no feedback)';
  const priority = body.state?.values?.priority_block?.priority_select?.selected_option?.value || 'not specified';
  
  console.log(`User ${user} clicked approve with feedback: ${feedback}, priority: ${priority}`);
  
  // update the original message to disable interactions
  await client.chat.update({
    channel: body.channel.id,
    ts: body.message.ts,
    text: `Approval needed from <@${user}>`,
    blocks: [
      {
        type: 'section',
        text: { type: 'mrkdwn', text: `✅ *Approved by <@${user}>*\n_Priority: ${priority}_\n_Feedback: ${feedback}_` }
      }
    ]
  });
  
  // post confirmation in thread (optional)
  await client.chat.postMessage({
    channel: body.channel.id,
    thread_ts: body.message.thread_ts || body.message.ts,
    text: `✅ <@${user}> approved.\nPriority: ${priority}\nFeedback: ${feedback}`
  });
});

app.action('reject_btn', async ({ ack, body, client }) => {
  await ack();
  const user = body.user.id;
  const feedback = body.state?.values?.approval_input?.feedback_text?.value || '(no feedback)';
  const priority = body.state?.values?.priority_block?.priority_select?.selected_option?.value || 'not specified';
  
  console.log(`User ${user} clicked reject with feedback: ${feedback}, priority: ${priority}`);
  
  // update the original message to disable interactions
  await client.chat.update({
    channel: body.channel.id,
    ts: body.message.ts,
    text: `Approval needed from <@${user}>`,
    blocks: [
      {
        type: 'section',
        text: { type: 'mrkdwn', text: `❌ *Rejected by <@${user}>*\n_Priority: ${priority}_\n_Feedback: ${feedback}_` }
      }
    ]
  });
  
  // post confirmation in thread (optional)
  await client.chat.postMessage({
    channel: body.channel.id,
    thread_ts: body.message.thread_ts || body.message.ts,
    text: `❌ <@${user}> rejected.\nPriority: ${priority}\nFeedback: ${feedback}`
  });
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
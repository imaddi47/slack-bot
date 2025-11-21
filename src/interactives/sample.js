const sampleInteractive = async ({ message, client, event }) => {
  // Your custom logic here
  console.log('Sample interactive message received:', { message, client });

  await client.chat.postMessage({
    channel: message.channel,
    text: 'Sample interactive message received and processed!',
    thread_ts: message.event_ts,
    text: `Sample Interaction from <@${message.user}>`,
    blocks: [
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `Requested by: <@${message.user}> | Time: <!date^${Math.floor(
              message.ts
            )}^{date_num} {time_secs}|${new Date(
              message.ts * 1000
            ).toISOString()}>`,
          },
        ],
      },
      {
        type: 'divider',
      },
      {
        type: 'actions',
        block_id: 'approval_actions',
        elements: [
          {
            type: 'button',
            text: { type: 'plain_text', text: '✅ Accept' },
            action_id: 'sample_approve_btn',
            value: message.user,
            style: 'primary',
          },
          {
            type: 'button',
            text: { type: 'plain_text', text: '❌ Reject' },
            action_id: 'sample_reject_btn',
            value: message.user,
            style: 'danger',
          },
          {
            type: 'button',
            text: { type: 'plain_text', text: 'ℹ️ Info' },
            action_id: 'sample_info_btn',
            value: message.user,
            style: 'primary',
          },
        ],
      },
    ],
  });
};

const sampleApproveAction = async ({ body, ack, client }) => {
  await ack();
  const user = body.user.id;
  console.log(`User ${user} clicked sample approve button`);

  // update the original message to disable interactions
  await client.chat.update({
    channel: body.channel.id,
    ts: body.message.ts,
    text: `Sample Interaction from <@${user}>`,
    blocks: [
      {
        type: 'section',
        text: { type: 'mrkdwn', text: `✅ *Approved by <@${user}>*` },
      },
    ],
  });
};

const sampleRejectAction = async ({ body, ack, client }) => {
  await ack();
  const user = body.user.id;
  console.log(`User ${user} clicked sample reject button`);

  // update the original message to disable interactions
  await client.chat.update({
    channel: body.channel.id,
    ts: body.message.ts,
    text: `Sample Interaction from <@${user}>`,
    blocks: [
      {
        type: 'section',
        text: { type: 'mrkdwn', text: `❌ *Rejected by <@${user}>*` },
      },
    ],
  });
};

const sampleInfoAction = async ({ body, ack, client }) => {
  await ack();
  await client.views.open({
    trigger_id: body.trigger_id,
    view: {
      type: 'modal',
      callback_id: 'priority_modal',
      title: { type: 'plain_text', text: 'Select Priority' },
      submit: { type: 'plain_text', text: 'Confirm' },
      blocks: [
        {
          type: 'input',
          block_id: 'priority_block',
          label: { type: 'plain_text', text: 'Priority' },
          element: {
            type: 'static_select',
            action_id: 'priority_choice',
            options: [
              { text: { type: 'plain_text', text: '🔴 High' }, value: 'high' },
              {
                text: { type: 'plain_text', text: '🟡 Medium' },
                value: 'medium',
              },
              { text: { type: 'plain_text', text: '🟢 Low' }, value: 'low' },
            ],
          },
        },
      ],
    },
  });
};

export const init = async (app) => {
  app.message('sample-interactive', sampleInteractive);
  app.action('sample_approve_btn', sampleApproveAction);
  app.action('sample_reject_btn', sampleRejectAction);
  app.action('sample_info_btn', sampleInfoAction);
  app.view('priority_modal', async ({ ack, body, view }) => {
    await ack();
    const priority =
      view.state.values.priority_block.priority_choice.selected_option.value;
    console.log('Priority selected:', priority);
  });
};

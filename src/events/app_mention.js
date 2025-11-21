const appMentionEventHandler = (payload) => {
  const { event, say } = payload;
  // Ignore messages from bots
  if (event.subtype === 'bot_message') {
    return;
  }

  say(`Hi <@${event.user}>! You mentioned me? How can I help?`);
};

export const init = async (app) => {
  app.event('app_mention', appMentionEventHandler);
};

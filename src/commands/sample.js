const sampleCommandHandler = async (payload) => {
    const { command, ack, respond, client, say } = payload;
    await ack(); // acknowledge immediately

    await respond({
        response_type: 'ephemeral',
        text: `Thanks <@${command.user_id}> — /sample received: "${command.text || '(no text)'}"`,
    });
}

export const init = async (app) => {
    app.command('/sample', sampleCommandHandler);
};

require('dotenv').config();

const { App } = require('@slack/bolt');
const signingSecret = process.env['SLACK_SIGNING_SECRET'];
const botToken = process.env['SLACK_BOT_TOKEN'];
const appToken = process.env['SLACK_APP_TOKEN'];

const app = new App({
	signingSecret: signingSecret,
	token: botToken,
	socketMode: true,
	appToken: appToken,
});

const voteTime = 1000 * 60 * 10;
const numberOfVotesNeeded = 1;

let timeoutObj = null;
let voteFlag = false;
let votesFor = 0;

app.start(process.env.PORT || 12000);

console.log(`⚡️ Bolt app is running!`);

//Initial command (start vote)
app.message('start chaina', async ({ message, say, logger }) => {
	if (voteFlag) return;

	voteFlag = true;

	await say({
		blocks: [
			{
				type: 'header',
				text: {
					type: 'plain_text',
					text: 'Czas na chinola :ghost:',
					emoji: true,
				},
			},
			{
				type: 'section',
				text: {
					type: 'plain_text',
					text: 'To kto chętny niech strzeli :white_check_mark:',
					emoji: true,
				},
			},
		],
		text: `Hey there <@${message.user}>!`,
	});

	timeoutObj = setTimeout(() => {
		voteFlag = false;
	}, voteTime);
});

app.event('reaction_added', async ({ event, client, logger }) => {
	switch (event.reaction) {
		case 'white_check_mark':
			if (!voteFlag) return;
			votesFor++; //add  a provisions that one user can only do it once

			if (votesFor === numberOfVotesNeeded) {

        clearTimeout(timeoutObj);
        timeoutObj = null;
        voteFlag = false;

				await client.chat.postMessage({
					channel: event.item.channel,
					text: `Welcome to the team, <@${event.user}>! 🎉 You can introduce          yourself in this channel.`,
				});
			}
			break;
	}
});

import app from "./client.js";
import { getMChessEmojis, logInteraction, saveState } from "./datahandler.js";
const aiApiUrl = "https://ai.hackclub.com/chat/completions";
const headers = {
	"Content-Type": "application/json"
};
const mainEmojis = [
	"brilliant-move",
	"great-move",
	"best-move",
	"alternative-move",
	"excellent-move",
	"good-move",
	"forced-move",
	"book-move",
	"inaccuracy-move",
	"mistake-move",
	"miss-move",
	"missed-win-move",
	"blunder-move"
];
const sideEmojis = [
	"checkmate-move",
	"draw-black-move",
	"fast-win-move",
	"critical-move",
	"free-piece-move"
];
const chances = {
	"fast-win-move": 0.9,
	"checkmate-move": 0.85,
	"brilliant-move": 0.8,
	"great-move": 0.75,
	"best-move": 0.7,
	"alternative-move": 0.7,
	"critical-move": 0.67,
	"excellent-move": 0.6,
	"good-move": 0.5,
	"forced-move": 0.4,
	"book-move": 0.4,
	"draw-black-move": 0.4,
	"inaccuracy-move": 0.5,
	"mistake-move": 0.55,
	"miss-move": 0.6,
	"missed-win-move": 0.6,
	"blunder-move": 0.67,
	"free-piece-move": 0.75
};
const magicFactor = 0.67;
const systemMessage = `The user message consists of a message that is sent in a conversation. Your job, as the Magical Chess Emojis bot, is to analyze the message sent and determine how it might correspond as some chess move categories. For example, just like in a chess game, commonly known starting "moves," or messages, that are used at the beginning of a conversation are book moves (book-move). If a message is, based on the context, the most reasonable and most expectable message to send, it would be considered the best move (best-move). If the message is, based on the context, just as reasonable as the expected best move, but less expected, it would be considered an alternative best move (alternative-move). If a message is, based on the context, very reasonable and rather expectable, but maybe not the BEST response, it should be an excellent move (excellent-move). If a message is, based on the context, not bad, though not really the most expected and not really the best response, it should be a good move (good-move). If a message is, based on the context, BETTER than the most expected reasonable "best move," and a little unexpected while bringing a little extra information to the conversation, it should be a great move (great-move). If a message is, based on the context, much BETTER than a great move, very unexpected, provides a lot of new and radical information, and changes the direction of the conversation, it should be a brilliant move (brilliant-move). If a message is, based on the context, the ONLY message that could possibly make sense, to the extent where it's basically just forced (for example if someone asks "Can you help me?" answering with "yes" or "ok" is forced), it should be a forced move (forced-move). If a message is, based on the context, not really optimal, and not as good as maybe a good move, but still kind of ok, it should be an inaccuracy (inaccuracy-move). If a message is, based on the context, kind of bad, but not SUPER bad, yet still worse than an inaccuracy, it should be a mistake (mistake-move). If a message is, based on the context, really bad, unreasonable, but still expectably the worst response, it should be a blunder (blunder-move). If, based on the context, there are many expected and pretty clear best and excellent moves, but the message sent is not any of them, instead being a simply acceptable message, the message should be considered a missed win (missed-win-move). `
	+ `If, based on the context, there are many expected and pretty clear best and excellent moves, but the message sent is a different move that should be fine, but loses much of the "advantage" that could have been had, it should be considered an incorrect move (miss-move). You need to choose EXACTLY ONE of the following strings, separated by a space: ${mainEmojis.join(", ")}. Additionally, you need to choose up to two of the other possible types of categories. If a message, based on the context, is also either the best move, great, or brilliant, as well as being something that doesn't really have a good reponse because it's kind of a conversational "checkmate," the move should be a checkmate (checkmate-move). If a message, based on the context, is not a bad move, and basically results in no good response because nobody is like completely winning, and it's kind of like a stalemate of some sort, the move should be a draw (draw-black-move). If, based on the context, it appears as though the conversation is very short, maybe within six to two to three messages, and the message could be classified as a checkmate, classify it instead as fast win (fast-win-move). If a message is, based on the context, classifiable as any really good move (brilliant, great, or best), it should be classified as critical (critical-move). If a message is, based on the context, a pretty bad move (mistake or blunder), and the move seems to give something away, like an opportunity or other advantage, it should be classified as a free piece (free-piece-move). You need to choose anywhere from ZERO TO TWO of the following strings, separated by spaces: ${sideEmojis.join(", ")}. Your final output MUST be EXACTLY the list of all the strings you chose (the original classification as well as the secondary classifications), separated with EXACTLY a space in between each string and nothing else.

Finally, this is the context of the conversation. Do consider, however, that it may be incomplete (missing some users). Just so you know, it's currently `;
const lraj23BotTestingId = "C09GR27104V";
const lraj23UserId = "U0947SL6AKB";

const isInConversation = (userId, MChessEmojis) => !MChessEmojis.conversations.map(convo => [convo.white, convo.black]).flat().reduce((product, id) => product * (+!(id === userId)), 1);
const convoIsIn = (userId, MChessEmojis) => MChessEmojis.conversations.find(convo => [convo.white, convo.black].includes(userId));

app.message('', async ({ message }) => {
	let MChessEmojis = getMChessEmojis();
	if (!Object.keys(MChessEmojis.whiteListedChannels).includes(message.channel)) return;
	let userId = message.user;
	let isInConvo = isInConversation(userId, MChessEmojis) && convoIsIn(userId, MChessEmojis).channel === message.channel;
	if (!MChessEmojis.gameOptedIn.includes(userId)) {
		if (message.channel === lraj23BotTestingId) await app.client.chat.postEphemeral({
			channel: lraj23BotTestingId,
			user: userId,
			blocks: [
				{
					"type": "section",
					"text": {
						"type": "mrkdwn",
						"text": `You aren't opted in to Magical Chess Emojis! Opt in with /mchessemojis-game-opt-in`
					}
				}
			],
			text: `You aren't opted in to Magical Chess Emojis! Opt in with /mchessemojis-game-opt-in`,
			thread_ts: ((message.thread_ts == message.ts) ? undefined : message.thread_ts)
		});
		return;
	}
	if (message.text.toLowerCase().includes("secret button") && !isInConvo) {
		await app.client.reactions.add({
			"channel": message.channel,
			"name": mainEmojis[0],
			"timestamp": message.ts
		});
		return;
	}
	if (message.ts - MChessEmojis.apiRequests[userId] < 1) {
		await app.client.reactions.add({
			"channel": message.channel,
			"name": "you-sent-a-message-too-fast-so-no-ai-request-to-avoid-rate-limit",
			"timestamp": message.ts
		});
		if (MChessEmojis.explanationOptedIn.includes(userId))
			await app.client.chat.postEphemeral({
				channel: message.channel,
				user: userId,
				text: `Your message was not reacted to because, in order to avoid getting rate limited, there is a cooldown of 1 second per user. :you-sent-a-message-too-fast-so-no-ai-request-to-avoid-rate-limit:`,
				thread_ts: ((message.thread_ts == message.ts) ? undefined : message.thread_ts)
			});
		return;
	} else MChessEmojis.apiRequests[userId] = message.ts;
	saveState(MChessEmojis);
	let pastMessages = isInConvo ? convoIsIn(userId, MChessEmojis).messages : (await app.client.conversations.history({
		token: process.env.CEMOJIS_BOT_TOKEN,
		channel: message.channel,
		latest: message.ts * 1000,
		limit: 30
	})).messages.filter((msg, i) => (MChessEmojis.dataOptedIn.includes(msg.user) && i)).reverse();
	console.log(message.text);
	const response = await fetch(aiApiUrl, {
		method: "POST",
		headers,
		body: JSON.stringify({
			"model": "openai/gpt-oss-120b",
			"messages": [
				{
					"role": "system",
					"content": systemMessage + new Date(Date.now()).toString() + ":\n" + pastMessages.map(msg => "User " + msg.user + " said (on " + new Date(1000 * msg.ts).toString() + "): " + msg.text).join("\n")
				},
				{
					"role": "user",
					"content": message.text
				}
			]
		})
	});
	const data = await response.json();
	if (data.error) if (data.error.message) if (data.error.message.split(":")[0] === "Rate limit exceeded") {
		await app.client.reactions.add({
			"channel": message.channel,
			"name": "sorry-my-ai-api-got-rate-limited",
			"timestamp": message.ts
		});
		if (MChessEmojis.explanationOptedIn.includes(userId))
			await app.client.chat.postEphemeral({
				channel: message.channel,
				user: userId,
				text: `Your message was not reacted to because my AI API got rate limited. :sorry-my-ai-api-got-rate-limited:`,
				thread_ts: ((message.thread_ts == message.ts) ? undefined : message.thread_ts)
			});
		return;
	}
	console.log(data.choices[0].message);
	let reactions = data.choices[0].message.content.split(" ");
	reactions = reactions.filter((reaction, i) => reactions.indexOf(reaction) === i);
	reactions.forEach(async reaction => {
		if (![...mainEmojis, ...sideEmojis].includes(reaction)) return;
		const rand = userId === lraj23UserId ? 0 : Math.random(); // everything *I* send is magical!
		if (rand < chances[reaction] * magicFactor) {
			let unusedIds = new Array(MChessEmojis.powerUps.length).fill(null).map((val, i) => i);
			for (var i = 0; i < MChessEmojis.powerUps.length; i++) {
				if (MChessEmojis.powerUps.map(power => power.id).includes(i)) unusedIds.splice(unusedIds.indexOf(i), 1);
				else break;
			}
			MChessEmojis.powerUps.push({
				id: unusedIds[0],
				owner: userId,
				type: reaction,
				active: false
			});
			reaction = "magical-" + reaction;
		}
		console.log(rand, reaction);
		await app.client.reactions.add({
			"channel": message.channel,
			"name": reaction,
			"timestamp": message.ts
		});
	});
	if (MChessEmojis.explanationOptedIn.includes(userId)) await app.client.chat.postEphemeral({
		channel: message.channel,
		user: userId,
		text: data.choices[0].message.reasoning || ":error_web:",
		thread_ts: ((message.thread_ts == message.ts) ? undefined : message.thread_ts)
	});
	saveState(MChessEmojis);
});

app.command('/mchessemojis-data-opt-in', async interaction => {
	await interaction.ack();
	await logInteraction(interaction);
	let userId = interaction.payload.user_id;
	let MChessEmojis = getMChessEmojis();

	if (MChessEmojis.dataOptedIn.includes(userId))
		return await interaction.respond(`You have already opted into the Magical Chess Emojis bot's data collection! :${mainEmojis[8]}:`);

	await interaction.respond(`You opted into the Magical Chess Emojis bot's data collection!! :${mainEmojis[4]}:`);
	MChessEmojis.dataOptedIn.push(userId);
	saveState(MChessEmojis);
});

app.command('/mchessemojis-game-opt-in', async interaction => {
	await interaction.ack();
	await logInteraction(interaction);
	let userId = interaction.payload.user_id;
	let MChessEmojis = getMChessEmojis();

	if (MChessEmojis.gameOptedIn.includes(userId))
		return await interaction.respond(`You have already opted into the Magical Chess Emojis game! :${mainEmojis[8]}:`);

	await interaction.respond(`You opted into the Magical Chess Emojis game!! :${sideEmojis[3]}: This also opts you into the bot's data collection.`);
	MChessEmojis.gameOptedIn.push(userId);
	if (!MChessEmojis.coins[userId]) MChessEmojis.coins[userId] = 0;
	if (!MChessEmojis.dataOptedIn.includes(userId)) MChessEmojis.dataOptedIn.push(userId);
	saveState(MChessEmojis);
});

app.command('/mchessemojis-explain-opt-in', async interaction => {
	await interaction.ack();
	await logInteraction(interaction);
	let userId = interaction.payload.user_id;
	let MChessEmojis = getMChessEmojis();

	if (MChessEmojis.explanationOptedIn.includes(userId))
		return await interaction.respond(`You have already opted into the Magical Chess Emojis bot's explanations! :${mainEmojis[8]}:`);

	await interaction.respond(`You opted into the Magical Chess Emojis bot's explanations!! :${mainEmojis[1]}: This also opts you into the game and data collection.`);
	MChessEmojis.explanationOptedIn.push(userId);
	if (!MChessEmojis.gameOptedIn.includes(userId)) MChessEmojis.gameOptedIn.push(userId);
	if (!MChessEmojis.dataOptedIn.includes(userId)) MChessEmojis.dataOptedIn.push(userId);
	saveState(MChessEmojis);
});

app.command('/mchessemojis-data-opt-out', async interaction => {
	await interaction.ack();
	await logInteraction(interaction);
	let userId = interaction.payload.user_id;
	let MChessEmojis = getMChessEmojis();

	if (MChessEmojis.dataOptedIn.includes(userId)) {
		await interaction.respond(`You opted out of the Magical Chess Emojis bot's data collection. :${mainEmojis[9]}: This also opts you out of the game and explanations.`);
		MChessEmojis.dataOptedIn.splice(MChessEmojis.dataOptedIn.indexOf(userId), 1);
		if (MChessEmojis.gameOptedIn.includes(userId)) MChessEmojis.gameOptedIn.splice(MChessEmojis.gameOptedIn.indexOf(userId), 1);
		if (MChessEmojis.explanationOptedIn.includes(userId)) MChessEmojis.explanationOptedIn.splice(MChessEmojis.explanationOptedIn.indexOf(userId), 1);
		saveState(MChessEmojis);
		return;
	}

	await interaction.respond(`You can't opt out because you aren't opted into the Magical Chess Emojis bot's data collection! :${sideEmojis[4]}:`);
});

app.command('/mchessemojis-game-opt-out', async interaction => {
	await interaction.ack();
	await logInteraction(interaction);
	let userId = interaction.payload.user_id;
	let MChessEmojis = getMChessEmojis();

	if (MChessEmojis.gameOptedIn.includes(userId)) {
		await interaction.respond(`You opted out of the Magical Chess Emojis game. :${sideEmojis[0]}: This also opts you out of the bot's explanations.`);
		MChessEmojis.gameOptedIn.splice(MChessEmojis.gameOptedIn.indexOf(userId), 1);
		if (MChessEmojis.explanationOptedIn.includes(userId)) MChessEmojis.explanationOptedIn.splice(MChessEmojis.explanationOptedIn.indexOf(userId), 1);
		saveState(MChessEmojis);
		return;
	}

	await interaction.respond(`You can't opt out because you aren't opted into the Magical Chess Emojis game! :${sideEmojis[4]}:`);
});

app.command('/mchessemojis-explain-opt-out', async interaction => {
	await interaction.ack();
	await logInteraction(interaction);
	let userId = interaction.payload.user_id;
	let MChessEmojis = getMChessEmojis();

	if (MChessEmojis.explanationOptedIn.includes(userId)) {
		await interaction.respond(`You opted out of the Magical Chess Emojis bot's explanations. :${mainEmojis[11]}:`);
		MChessEmojis.explanationOptedIn.splice(MChessEmojis.explanationOptedIn.indexOf(userId), 1);
		saveState(MChessEmojis);
		return;
	}

	await interaction.respond(`You can't opt out because you aren't opted into the Magical Chess Emojis bot's explanations! :${sideEmojis[4]}:`);
});

app.command('/mchessemojis-start-game', async interaction => {
	await interaction.ack();
	let MChessEmojis = getMChessEmojis();
	let userId = interaction.payload.user_id;
	return await interaction.respond(`Since this is Magical Chess Emojis and not Competitive Chess Emojis, this feature should not exist. Therefore, you can not access this feature. Eventually the actual features will come out`);
	if (!MChessEmojis.gameOptedIn.includes(userId))
		return await interaction.respond(`You aren't opted into the Magical Chess Emojis game! :${mainEmojis[11]}: Opt in first with /mchessemojis-game-opt-in before trying to play!`);
	if (isInConversation(userId, MChessEmojis))
		return await interaction.respond(`You can't start a game if you are currently in a game! If you finished your last game already, try running <command that doesn't work yet> and trying again.`);
	await interaction.client.chat.postEphemeral({
		"channel": interaction.command.channel_id,
		"user": userId,
		"blocks": [
			{
				"type": "section",
				"text": {
					"type": "mrkdwn",
					"text": `Choose someone to play against:`
				},
				"accessory": {
					"type": "users_select",
					"placeholder": {
						"type": "plain_text",
						"text": "Default: yourself",
						"emoji": true
					},
					"action_id": "ignore-start-black"
				},
			},
			{
				"type": "actions",
				"elements": [
					{
						"type": "button",
						"text": {
							"type": "plain_text",
							"text": ":x: Cancel",
							"emoji": true
						},
						"value": "cancel",
						"action_id": "cancel"
					},
					{
						"type": "button",
						"text": {
							"type": "plain_text",
							"text": ":white_check_mark: Go!",
							"emoji": true
						},
						"value": "confirm",
						"action_id": "confirm"
					}
				]
			}
		],
		"text": `Choose someone to play against:`
	});
});

app.action(/^ignore-.+$/, async interaction => await interaction.ack());

app.action('cancel', async interaction => [await interaction.ack(), await interaction.respond({ "delete_original": true })]);

// const getValues = interaction => Object.fromEntries(Object.values(interaction.body.state.values).map(inputInfo => [(key => key[key.length - 1])(Object.entries(inputInfo)[0][0].split("-")), (input => ("selected_option" in input) ? input.selected_option?.value : (input || input))(Object.entries(inputInfo)[0][1])]));

app.action('confirm', async interaction => {
	await interaction.ack();
	let MChessEmojis = getMChessEmojis();
	let whiteId = interaction.body.user.id;
	let blackId = interaction.body.state.values[Object.keys(interaction.body.state.values)[0]]["ignore-start-black"].selected_user || whiteId;

	if (isInConversation(blackId, MChessEmojis))
		return await interaction.respond(`You can't start a game if <@${blackId}> is currently in a game! Try asking <@${blackId}> if they are done with their game.`);

	if (!MChessEmojis.gameOptedIn.includes(blackId)) {
		await interaction.respond(`<@${blackId}> isn't opted into the Magical Chess Emojis game! They need to opt in first with /mchessemojis-game-opt-in before they can play!`);
		// if (whiteId === lraj23UserId)
		// await app.client.chat.postEphemeral({
		// 	channel: blackId,
		// 	user: blackId,
		// 	text: `<@${whiteId}> tried to start a Magical Chess Emojis game against you, but you aren't opted in. If you want to play, run /mchessemojis-game-opt-in in <#${lraj23BotTestingId}> and challenge them back. If you don't want to receive this message again, try telling <@${whiteId}> that you don't want to play against them. (I will eventually make a button to opt out of game requests - lraj23, bot developer.)`
		// });
		return;
	}

	MChessEmojis.conversations.push({
		white: whiteId,
		black: blackId,
		channel: interaction.body.channel.id,
		initiated: Date.now(),
		messages: []
	});
	await interaction.respond(`<@${whiteId}> has started a game against <@${blackId}>. You are playing as White!`);
	await app.client.chat.postMessage({
		channel: blackId,
		text: `<@${whiteId}> has started a Magical Chess Emojis game against you in <#${interaction.body.channel.id}>. Head over there now to talk to them and earn some :siege-coin:! You are playing as Black.`
	});
	saveState(MChessEmojis);
});

app.command('/mchessemojis-resign-game', async interaction => {
	await interaction.ack();
	let MChessEmojis = getMChessEmojis();
	let userId = interaction.payload.user_id;

	return await interaction.respond(`Since this is Magical Chess Emojis and not Competitive Chess Emojis, this feature should not exist. Therefore, you can not access this feature. Eventually the actual features will come out`);

	await interaction.respond(`The resign feature works now! Until October 7, 8:30 PM Eastern Time, you couldn't resign.`);

	if (!isInConversation(userId, MChessEmojis))
		return await interaction.respond(`You can't resign if you aren't playing one! Try starting a game with /mchessemojis-start-game first!`);

	await interaction.client.chat.postEphemeral({
		"channel": interaction.command.channel_id,
		"user": userId,
		"blocks": [
			{
				"type": "section",
				"text": {
					"type": "mrkdwn",
					"text": `Are you SURE you want to resign? :resign-move: You will lose 6-7 :siege-coin:!`
				}
			},
			{
				"type": "actions",
				"elements": [
					{
						"type": "button",
						"text": {
							"type": "plain_text",
							"text": ":x: No!",
							"emoji": true
						},
						"value": "cancel",
						"action_id": "cancel"
					},
					{
						"type": "button",
						"text": {
							"type": "plain_text",
							"text": ":resign-move: Yes",
							"emoji": true
						},
						"value": "resign",
						"action_id": "resign"
					}
				]
			}
		],
		"text": `Are you SURE you want to resign? :resign-move: You will lose 6-7 :siege-coin:!`
	});
});

app.action('resign', async interaction => {
	await interaction.ack();
	let MChessEmojis = getMChessEmojis();
	let resignId = interaction.body.user.id;
	let conversation = convoIsIn(resignId, MChessEmojis);
	let winnerId = conversation.black === resignId ? conversation.white : conversation.black;

	let coinsLost = Math.floor(Math.random() * -2) - 5;
	MChessEmojis.coins[resignId] += coinsLost;
	await interaction.respond(`<@${resignId}> has resigned their game against <@${winnerId}>. Your coin balance has changed by ${coinsLost} :siege-coin:`);
	await app.client.chat.postMessage({
		channel: winnerId,
		text: `<@${resignId}> has resigned their Magical Chess Emojis game against you in <#${interaction.body.channel.id}>. They lost ${-coinsLost} :siege-coin: for resigning.`
	});
	MChessEmojis.conversations.splice(MChessEmojis.conversations.indexOf(conversation), 1);
	saveState(MChessEmojis);
});

app.command('/mchessemojis-leaderboard', async interaction => await interaction.respond(`Since this is Magical Chess Emojis and not Competitive Chess Emojis, this feature should not exist. Therefore, you can not access this feature. Eventually the actual features will come out`));
// [await interaction.ack(), await interaction.respond(`This is the Magical Chess Emojis game leaderboard! :siege-coin:\n\n` + Object.entries(getMChessEmojis().coins).sort((a, b) => b[1] - a[1]).map(user => `<@${user[0]}> has ${user[1]} :siege-coin:!`).join("\n"))]);

app.command('/mchessemojis-help', async interaction => [await interaction.ack(), await interaction.respond(`This is the Magical Chess Emojis bot! However, this help command can only help you for the Competitive Chess Emojis bot! Here is the help for that bot: The point of this is to earn coins through conversations worth coins against other people. Your coins are based on how each message is rated as a chess move. Since this uses AI to determine how good a message is, you have to opt IN for it to work.\nFor more information, check out the readme at https://github.com/lraj23/competitive-chess-emojis`), interaction.payload.user_id === lraj23UserId ? await interaction.respond(`Test but only for <@${lraj23UserId}>. If you aren't him and you see this message, DM him IMMEDIATELY about this!`) : null]);

app.command('/mchessemojis-channel-opt-in', async interaction => {
	await interaction.ack();
	await logInteraction(interaction);
	const channelId = interaction.command.channel_id;
	const userId = interaction.payload.user_id;
	const channelInfo = await interaction.client.conversations.info({
		channel: channelId,
		include_full_members: true
	});
	console.log(channelInfo.channel.creator);
	if (!(channelInfo.channel.creator === userId)) return await interaction.respond(`You aren't the channel creator, so you can not opt this bot in or out of the channel. :resign-move: You may have meant to run /mchessemojis-game-opt-in instead`);

	const channelName = channelInfo.channel.name;
	let MChessEmojis = getMChessEmojis();
	if (Object.keys(MChessEmojis.whiteListedChannels).includes(channelId))
		return await interaction.respond(`You have already opted <#${channelId}> into this bot! :${mainEmojis[8]}:`);
	await interaction.say(`<@${userId}> opted <#${channelId}> into this bot! :${sideEmojis[3]}:`);
	MChessEmojis.whiteListedChannels[channelId] = channelName;
	saveState(MChessEmojis);
});

app.command('/mchessemojis-channel-opt-out', async interaction => {
	await interaction.ack();
	await logInteraction(interaction);
	const channelId = interaction.command.channel_id;
	const userId = interaction.payload.user_id;
	const channelInfo = await interaction.client.conversations.info({
		channel: channelId,
		include_full_members: true
	});
	console.log(channelInfo.channel.creator);
	if (!(channelInfo.channel.creator === userId)) return await interaction.respond(`You aren't the channel creator, so you can not opt this bot in or out of the channel. :resign-move: You may have meant to run /mchessemojis-game-opt-out instead`);

	let MChessEmojis = getMChessEmojis();
	if (!Object.keys(MChessEmojis.whiteListedChannels).includes(channelId))
		return await interaction.respond(`You can't opt <#${channelId}> out because it isn't opted in! :${sideEmojis[4]}:`);
	await interaction.say(`<@${userId}> opted <#${channelId}> out of this bot! :${mainEmojis[11]}:`);
	delete MChessEmojis.whiteListedChannels[channelId];
	saveState(MChessEmojis);
});

app.message(/secret button/i, async ({ message }) => {
	await app.client.chat.postEphemeral({
		channel: message.channel,
		user: message.user,
		blocks: [
			{
				"type": "section",
				"text": {
					"type": "mrkdwn",
					"text": `<@${message.user}> mentioned the secret button! Here it is:`
				}
			},
			{
				"type": "actions",
				"elements": [
					{
						"type": "button",
						"text": {
							"type": "plain_text",
							"text": "Secret Button :" + mainEmojis[0] + ":"
						},
						"action_id": "button_click"
					}
				]
			}
		],
		text: `<@${message.user}> mentioned the secret button! Here it is:`,
		thread_ts: ((message.thread_ts == message.ts) ? undefined : message.thread_ts)
	});
});

app.action('button_click', async ({ body, ack, respond }) => {
	await ack();
	await app.client.chat.postEphemeral({
		channel: body.channel.id,
		user: body.user.id,
		blocks: [
			{
				"type": "section",
				"text": {
					"type": "mrkdwn",
					"text": `You found the secret button :${mainEmojis[0]}: Here it is again.`
				}
			},
			{
				"type": "actions",
				"elements": [
					{
						"type": "button",
						"text": {
							"type": "plain_text",
							"text": "Secret Button :" + mainEmojis[0] + ":"
						},
						"action_id": "button_click"
					}
				]
			}
		],
		text: `You found the secret button :${mainEmojis[0]}: Here it is again.`,
		thread_ts: body.container.thread_ts || undefined
	});
});
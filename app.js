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
const systemMessage = "The user message consists of a message that is sent in a conversation. Your job, as the Magical Chess Emojis bot, is to analyze the message sent and determine how it might correspond as some chess move categories. For example, just like in a chess game, commonly known starting \"moves,\" or messages, that are used at the beginning of a conversation are book moves (book-move). If a message is, based on the context, the most reasonable and most expectable message to send, it would be considered the best move (best-move). If the message is, based on the context, just as reasonable as the expected best move, but less expected, it would be considered an alternative best move (alternative-move). If a message is, based on the context, very reasonable and rather expectable, but maybe not the BEST response, it should be an excellent move (excellent-move). If a message is, based on the context, not bad, though not really the most expected and not really the best response, it should be a good move (good-move). If a message is, based on the context, BETTER than the most expected reasonable \"best move,\" and a little unexpected while bringing a little extra information to the conversation, it should be a great move (great-move). If a message is, based on the context, much BETTER than a great move, very unexpected, provides a lot of new and radical information, and changes the direction of the conversation, it should be a brilliant move (brilliant-move). If a message is, based on the context, the ONLY message that could possibly make sense, to the extent where it's basically just forced (for example if someone asks \"Can you help me?\" answering with \"yes\" or \"ok\" is forced), it should be a forced move (forced-move). If a message is, based on the context, not really optimal, and not as good as maybe a good move, but still kind of ok, it should be an inaccuracy (inaccuracy-move). If a message is, based on the context, kind of bad, but not SUPER bad, yet still worse than an inaccuracy, it should be a mistake (mistake-move). If a message is, based on the context, really bad, unreasonable, but still expectably the worst response, it should be a blunder (blunder-move). If, based on the context, there are many expected and pretty clear best and excellent moves, but the message sent is not any of them, instead being a simply acceptable message, the message should be considered a missed win (missed-win-move). "
	+ "If, based on the context, there are many expected and pretty clear best and excellent moves, but the message sent is a different move that should be fine, but loses much of the \"advantage\" that could have been had, it should be considered an incorrect move (miss-move). You need to choose EXACTLY ONE of the following strings, separated by a space: "
	+ mainEmojis.join(", ") + ". Additionally, you need to choose up to two of the other possible types of categories. If a message, based on the context, is also either the best move, great, or brilliant, as well as being something that doesn't really have a good reponse because it's kind of a conversational \"checkmate,\" the move should be a checkmate (checkmate-move). If a message, based on the context, is not a bad move, and basically results in no good response because nobody is like completely winning, and it's kind of like a stalemate of some sort, the move should be a draw (draw-black-move). If, based on the context, it appears as though the conversation is very short, maybe within six to two to three messages, and the message could be classified as a checkmate, classify it instead as fast win (fast-win-move). If a message is, based on the context, classifiable as any really good move (brilliant, great, or best), it should be classified as critical (critical-move). If a message is, based on the context, a pretty bad move (mistake or blunder), and the move seems to give something away, like an opportunity or other advantage, it should be classified as a free piece (free-piece-move). You need to choose anywhere from ZERO TO TWO of the following strings, separated by spaces: " + sideEmojis.join(", ") + ". Your final output MUST be EXACTLY the list of all the strings you chose (the original classification as well as the secondary classifications), separated with EXACTLY a space in between each string and nothing else.\n\nFinally, this is the context of the conversation. Do consider, however, that it may be incomplete (missing some users). Just so you know, it's currently ";
const lraj23BotTestingId = "C09GR27104V";
const lraj23UserId = "U0947SL6AKB";

const isInConversation = (userId, MChessEmojis) => !MChessEmojis.conversations.map(convo => [convo.white, convo.black]).flat().reduce((product, id) => product * (+!(id === userId)), 1);
const activePowerUps = MChessEmojis => MChessEmojis.powerUps.filter(powerUp => powerUp.active);
const convoIsIn = (userId, MChessEmojis) => MChessEmojis.conversations.find(convo => [convo.white, convo.black].includes(userId));

app.message("", async ({ message }) => {
	let MChessEmojis = getMChessEmojis();
	if (!Object.keys(MChessEmojis.whiteListedChannels).includes(message.channel)) return;
	const userId = message.user;
	let activePowerUpsTypes = MChessEmojis => activePowerUps(MChessEmojis).map(powerUp => powerUp.type);
	if (!MChessEmojis.gameOptedIn.includes(userId)) {
		if (message.channel === lraj23BotTestingId) await app.client.chat.postEphemeral({
			channel: lraj23BotTestingId,
			user: userId,
			blocks: [
				{
					type: "section",
					text: {
						type: "mrkdwn",
						text: "You aren't opted in to Magical Chess Emojis! Opt in to \"Data + reactions\" with /mchessemojis-edit-opts"
					}
				}
			],
			text: "You aren't opted in to Magical Chess Emojis! Opt in to \"Data + reactions\" with /mchessemojis-edit-opts",
			thread_ts: ((message.thread_ts == message.ts) ? undefined : message.thread_ts)
		});
		return;
	}
	if (activePowerUpsTypes(MChessEmojis).includes("fast-win-move")) {
		let fastWin = MChessEmojis.powerUps.find(powerUp => (powerUp.type === "fast-win-move" && powerUp.active));
		if (!userId === fastWin.owner) {
			await app.client.reactions.add({
				channel: message.channel,
				name: "magical-somebody-won-quickly-and-you-spoke-too-soon",
				timestamp: message.ts
			});
			if (fastWin.active === true) fastWin.active = 4;
			else fastWin.active--;
			if (fastWin.active === 0) MChessEmojis.powerUps.splice(MChessEmojis.powerUps.indexOf(fastWin), 1);
			return saveState(MChessEmojis);
		}
	}
	if (activePowerUpsTypes(MChessEmojis).includes("critical-move")) {
		await app.client.reactions.add({
			channel: message.channel,
			name: "magical-i-will-bury-you-alive-in-a-dark-alley-and-let-the-rats-feast-upon-your-corpse",
			timestamp: message.ts
		});
		MChessEmojis.powerUps.splice(MChessEmojis.powerUps.indexOf(MChessEmojis.powerUps.find(powerUp => (powerUp.type === "critical-move" && powerUp.active))), 1);
		return saveState(MChessEmojis);
	}
	if (message.text.toLowerCase().includes("secret button"))
		return await app.client.reactions.add({
			channel: message.channel,
			name: mainEmojis[0],
			timestamp: message.ts
		});
	if (message.ts - MChessEmojis.apiRequests[userId] < 1) {
		await app.client.reactions.add({
			channel: message.channel,
			name: "you-sent-a-message-too-fast-so-no-ai-request-to-avoid-rate-limit",
			timestamp: message.ts
		});
		if (MChessEmojis.explanationOptedIn.includes(userId))
			await app.client.chat.postEphemeral({
				channel: message.channel,
				user: userId,
				text: "Your message was not reacted to because, in order to avoid getting rate limited, there is a cooldown of 1 second per user. :you-sent-a-message-too-fast-so-no-ai-request-to-avoid-rate-limit:",
				thread_ts: ((message.thread_ts == message.ts) ? undefined : message.thread_ts)
			});
		return;
	} else MChessEmojis.apiRequests[userId] = message.ts;
	saveState(MChessEmojis);
	const pastMessages = (await app.client.conversations.history({
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
			model: "openai/gpt-oss-120b",
			messages: [
				{
					role: "system",
					content: systemMessage + new Date(Date.now()).toString() + ":\n" + pastMessages.map(msg => "User " + msg.user + " said (on " + new Date(1000 * msg.ts).toString() + "): " + msg.text).join("\n")
				},
				{
					role: "user",
					content: message.text
				}
			]
		})
	});
	const data = await response.json();
	if (data.error) if (data.error.message) if (data.error.message.split(":")[0] === "Rate limit exceeded") {
		await app.client.reactions.add({
			channel: message.channel,
			name: "sorry-my-ai-api-got-rate-limited",
			timestamp: message.ts
		});
		if (MChessEmojis.explanationOptedIn.includes(userId))
			await app.client.chat.postEphemeral({
				channel: message.channel,
				user: userId,
				text: "Your message was not reacted to because my AI API got rate limited. :sorry-my-ai-api-got-rate-limited:",
				thread_ts: ((message.thread_ts == message.ts) ? undefined : message.thread_ts)
			});
		return;
	}
	console.log(data.choices[0].message);
	let reactions = data.choices[0].message.content.split(" ");
	reactions = reactions.filter((reaction, i) => reactions.indexOf(reaction) === i);
	reactions.forEach(async reaction => {
		if (![...mainEmojis, ...sideEmojis].includes(reaction)) return;
		const rand = Math.random();
		if (rand < chances[reaction] * magicFactor) {
			let unusedIds = new Array(MChessEmojis.powerUps.length).fill(null).map((val, i) => i);
			for (let i = 0; i < MChessEmojis.powerUps.length; i++) {
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
			channel: message.channel,
			name: reaction,
			timestamp: message.ts
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

app.command("/mchessemojis-edit-opts", async interaction => {
	await interaction.ack();
	const userId = interaction.payload.user_id;
	let MChessEmojis = getMChessEmojis();
	const optInLevels = Object.entries({
		none: "Nothing :magical-" + mainEmojis[9] + ":",
		data: "Only data :magical-" + mainEmojis[4] + ":",
		game: "Data + reactions :magical-" + sideEmojis[3] + ":",
		explain: "EVERYTHING! :magical-" + mainEmojis[1] + ":"
	});
	const currentOpted = (MChessEmojis.explanationOptedIn.includes(userId) ? "explain" : (MChessEmojis.gameOptedIn.includes(userId) ? "game" : (MChessEmojis.dataOptedIn.includes(userId) ? "data" : "none")));
	await interaction.client.chat.postEphemeral({
		channel: interaction.command.channel_id,
		user: userId,
		text: "Choose which type of opt-in you want to have:",
		blocks: [
			{
				type: "section",
				text: {
					type: "mrkdwn",
					text: "Choose which type of opt-in you want to have:"
				},
				accessory: {
					type: "static_select",
					placeholder: {
						type: "plain_text",
						text: "Required",
						emoji: true
					},
					options: optInLevels.map(level => ({
						text: {
							type: "plain_text",
							text: level[1],
							emoji: true
						},
						value: level[0]
					})),
					initial_option: {
						text: {
							type: "plain_text",
							text: Object.fromEntries(optInLevels)[currentOpted],
							emoji: true
						},
						value: currentOpted
					},
					action_id: "ignore-opt-in-level"
				}
			},
			{
				type: "actions",
				elements: [
					{
						type: "button",
						text: {
							type: "plain_text",
							text: ":x: Cancel",
							emoji: true
						},
						value: "cancel",
						action_id: "cancel"
					},
					{
						type: "button",
						text: {
							type: "plain_text",
							text: ":white_check_mark: Go!",
							emoji: true
						},
						value: "confirm",
						action_id: "confirm-opt-change"
					}
				]
			}
		]
	});
});

app.action("confirm-opt-change", async interaction => {
	await interaction.ack();
	let MChessEmojis = getMChessEmojis();
	const userId = interaction.body.user.id;
	console.log(interaction.body.state.values);
	let optInLevel = (interaction.body.state.values[Object.keys(interaction.body.state.values)[0]]["ignore-opt-in-level"].selected_option || { value: "none" }).value;
	console.log(optInLevel);

	switch (optInLevel) {
		case "none":
			await interaction.respond("<@" + userId + "> set their opts to nothing. :magical-" + mainEmojis[9] + ": The bot will no longer interact with you whatsoever.");
			if (MChessEmojis.dataOptedIn.includes(userId)) MChessEmojis.dataOptedIn.splice(MChessEmojis.dataOptedIn.indexOf(userId), 1);
			if (MChessEmojis.gameOptedIn.includes(userId)) MChessEmojis.gameOptedIn.splice(MChessEmojis.gameOptedIn.indexOf(userId), 1);
			if (MChessEmojis.explanationOptedIn.includes(userId)) MChessEmojis.explanationOptedIn.splice(MChessEmojis.explanationOptedIn.indexOf(userId), 1);
			break;
		case "data":
			await interaction.respond("<@" + userId + "> set their opts to just data. :magical-" + mainEmojis[4] + ": The bot will read your messages, so your messages will be sent to an AI. This is to improve reactions given to other users. The bot will not interact with you otherwise.");
			if (!MChessEmojis.dataOptedIn.includes(userId)) MChessEmojis.dataOptedIn.push(userId);
			if (MChessEmojis.gameOptedIn.includes(userId)) MChessEmojis.gameOptedIn.splice(MChessEmojis.gameOptedIn.indexOf(userId), 1);
			if (MChessEmojis.explanationOptedIn.includes(userId)) MChessEmojis.explanationOptedIn.splice(MChessEmojis.explanationOptedIn.indexOf(userId), 1);
			break;
		case "game":
			await interaction.respond("<@" + userId + "> set their opts to data and reactions. :magical-" + sideEmojis[3] + ": The bot will read your messages, so your messages will be sent to an AI. Using your messages as well as those of others opted in to data or reactions, the bot will react to all of your messages sent ANYWHERE as long as the bot is in the channel and the bot has been channel opted in. The bot will not send you messages or interact otherwise.");
			if (!MChessEmojis.dataOptedIn.includes(userId)) MChessEmojis.dataOptedIn.push(userId);
			if (!MChessEmojis.gameOptedIn.includes(userId)) MChessEmojis.gameOptedIn.push(userId);
			if (MChessEmojis.explanationOptedIn.includes(userId)) MChessEmojis.explanationOptedIn.splice(MChessEmojis.explanationOptedIn.indexOf(userId), 1);
			break;
		case "explain":
			await interaction.respond("<@" + userId + "> set their opts to everything. :magical-" + mainEmojis[1] + ": The bot will read your messages, so your messages will be sent to an AI. Using your messages as well as those of others opted in to data or reactions, the bot will react to all of your messages sent ANYWHERE as long as the bot is in the channel and the bot has been channel opted in. Along with reacting, the bot will also send you a visible-only-to-you message to ALL your messages with the AI's thought process on its choices.");
			if (!MChessEmojis.dataOptedIn.includes(userId)) MChessEmojis.dataOptedIn.push(userId);
			if (!MChessEmojis.gameOptedIn.includes(userId)) MChessEmojis.gameOptedIn.push(userId);
			if (!MChessEmojis.explanationOptedIn.includes(userId)) MChessEmojis.explanationOptedIn.push(userId);
			break;
	}

	saveState(MChessEmojis);
});

app.command("/mchessemojis-use-magic", async interaction => {
	await interaction.ack();
	const MChessEmojis = getMChessEmojis();
	const userId = interaction.payload.user_id;
	if (!MChessEmojis.gameOptedIn.includes(userId))
		return await interaction.respond("You aren't opted into the Magical Chess Emojis game! :" + mainEmojis[11] + ": Opt in to \"Data + reactions\" first with /mchessemojis-edit-opts before trying to use your magic! (You may have magic, you just HAVE to be opted in to use it)");
	const powerUps = MChessEmojis.powerUps.filter(powerUp => powerUp.owner === userId);
	await interaction.client.chat.postEphemeral({
		channel: interaction.command.channel_id,
		user: userId,
		blocks: [
			{
				type: "section",
				text: {
					type: "mrkdwn",
					text: "Choose which type of power up to use:"
				},
				accessory: {
					type: "static_select",
					placeholder: {
						type: "plain_text",
						text: "Required",
						emoji: true
					},
					options: powerUps.filter((powerUp, i, self) => i === self.findIndex((o) => o.type === powerUp.type)).map(powerUp => ({
						text: {
							type: "plain_text",
							text: powerUp.type.split("-").join(" "),
							emoji: true
						},
						value: powerUp.type
					})),
					action_id: "ignore-power-up-type"
				}
			},
			{
				type: "actions",
				elements: [
					{
						type: "button",
						text: {
							type: "plain_text",
							text: ":x: Cancel",
							emoji: true
						},
						value: "cancel",
						action_id: "cancel"
					},
					{
						type: "button",
						text: {
							type: "plain_text",
							text: ":white_check_mark: Go!",
							emoji: true
						},
						value: "confirm",
						action_id: "confirm"
					}
				]
			}
		],
		text: "Choose someone to play against:"
	});
});

app.action(/^ignore-.+$/, async interaction => await interaction.ack());

app.action("cancel", async interaction => [await interaction.ack(), await interaction.respond({ "delete_original": true })]);

app.action("confirm", async interaction => {
	await interaction.ack();
	let MChessEmojis = getMChessEmojis();
	const userId = interaction.body.user.id;
	console.log(interaction.body.state.values);
	let powerUp = interaction.body.state.values[Object.keys(interaction.body.state.values)[0]]["ignore-power-up-type"].selected_option || null;
	const powerUps = MChessEmojis.powerUps.filter(powerUp => powerUp.owner === userId);

	if (powerUp === null)
		return await interaction.respond("You have to select a power up type!");
	powerUp = powerUp.value;

	if (!powerUps.map(powerUp => powerUp.type).includes(powerUp))
		return await interaction.respond("<@" + userId + "> no longer has a power up of type " + powerUp + "! Stop trying to fraud please /j");

	MChessEmojis.powerUps.filter(powerUp => powerUp.owner === userId).filter(pwrUp => (pwrUp.type === powerUp && !pwrUp.active))[0].active = true;
	await interaction.respond("<@" + userId + "> has used a power up of type " + powerUp + "!");
	saveState(MChessEmojis);
});

app.command("/mchessemojis-help", async interaction => [await interaction.ack(), await interaction.respond("This is the Magical Chess Emojis bot! However, this help command can only help you for the Competitive Chess Emojis bot! Here is the help for that bot: The point of this is to earn coins through conversations worth coins against other people. Your coins are based on how each message is rated as a chess move. Since this uses AI to determine how good a message is, you have to opt IN for it to work.\nFor more information, check out the readme at https://github.com/lraj23/competitive-chess-emojis"), interaction.payload.user_id === lraj23UserId ? await interaction.respond("Test but only for <@" + lraj23UserId + ">. If you aren't him and you see this message, DM him IMMEDIATELY about this!") : null]);

app.command("/mchessemojis-channel-opt-in", async interaction => {
	await interaction.ack();
	await logInteraction(interaction);
	const channelId = interaction.command.channel_id;
	const userId = interaction.payload.user_id;
	const channelInfo = await interaction.client.conversations.info({
		channel: channelId,
		include_full_members: true
	});
	console.log(channelInfo.channel.creator);
	if (!(channelInfo.channel.creator === userId)) return await interaction.respond("You aren't the channel creator, so you can not opt this bot in or out of the channel. :resign-move: You may have meant to run /mchessemojis-edit-opts instead");

	const channelName = channelInfo.channel.name;
	let MChessEmojis = getMChessEmojis();
	if (Object.keys(MChessEmojis.whiteListedChannels).includes(channelId))
		return await interaction.respond("You have already opted <#" + channelId + "> into this bot! :" + mainEmojis[8] + ":");
	await interaction.say("<@" + userId + "> opted <#" + channelId + "> into this bot! :" + sideEmojis[3] + ":");
	MChessEmojis.whiteListedChannels[channelId] = channelName;
	saveState(MChessEmojis);
});

app.command("/mchessemojis-channel-opt-out", async interaction => {
	await interaction.ack();
	await logInteraction(interaction);
	const channelId = interaction.command.channel_id;
	const userId = interaction.payload.user_id;
	const channelInfo = await interaction.client.conversations.info({
		channel: channelId,
		include_full_members: true
	});
	console.log(channelInfo.channel.creator);
	if (!(channelInfo.channel.creator === userId)) return await interaction.respond("You aren't the channel creator, so you can not opt this bot in or out of the channel. :resign-move: You may have meant to run /mchessemojis-edit-opts instead");

	let MChessEmojis = getMChessEmojis();
	if (!Object.keys(MChessEmojis.whiteListedChannels).includes(channelId))
		return await interaction.respond("You can't opt <#" + channelId + "> out because it isn't opted in! :" + sideEmojis[4] + ":");
	await interaction.say("<@+" + userId + "> opted <#" + channelId + "> out of this bot! :" + mainEmojis[11] + ":");
	delete MChessEmojis.whiteListedChannels[channelId];
	saveState(MChessEmojis);
});

app.message(/secret button/i, async ({ message }) => {
	await app.client.chat.postEphemeral({
		channel: message.channel,
		user: message.user,
		blocks: [
			{
				type: "section",
				text: {
					type: "mrkdwn",
					text: "<@" + message.user + "> mentioned the secret button! Here it is:"
				}
			},
			{
				type: "actions",
				elements: [
					{
						type: "button",
						text: {
							type: "plain_text",
							text: "Secret Button :" + mainEmojis[0] + ":"
						},
						action_id: "button_click"
					}
				]
			}
		],
		text: "<@" + message.user + "> mentioned the secret button! Here it is:",
		thread_ts: ((message.thread_ts == message.ts) ? undefined : message.thread_ts)
	});
});

app.action("button_click", async ({ body, ack, respond }) => {
	await ack();
	await app.client.chat.postEphemeral({
		channel: body.channel.id,
		user: body.user.id,
		blocks: [
			{
				type: "section",
				text: {
					type: "mrkdwn",
					text: "You found the secret button :" + mainEmojis[0] + ": Here it is again."
				}
			},
			{
				type: "actions",
				elements: [
					{
						type: "button",
						text: {
							type: "plain_text",
							text: "Secret Button :" + mainEmojis[0] + ":"
						},
						action_id: "button_click"
					}
				]
			}
		],
		text: "You found the secret button :" + mainEmojis[0] + ": Here it is again.",
		thread_ts: body.container.thread_ts || undefined
	});
});
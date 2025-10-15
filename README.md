# Magical Chess Emojis

### Main Purpose

The point of this bot is to analyze your conversations and react with an appropriate chess for each emoji (there's a LOT of different emojis now). Sometimes and randomly, the bot will react with a magical chess emoji instead of a normal one. When this happens, you gain a power up of that type of emoji. To do this, it uses the AI from ai.hackclub.com (specifically openai/gpt-oss-120b).

### Commands

Since this bot sends all of your messages to an AI, and a lot of people probably don't like that, especially without consent or being notified, you can only get reactions if you opt in.

#### /mchessemojis-edit-opts
This command combines the six main opt commands from previous bots into one. Running this command brings up a dropdown menu with four different options of how opted in the user wants to be. The four options are as follows:
1. None. This, as it seems to imply, means that none of your data will go to an AI, and the bot will not interact with you at all unless you interact with it. It will not react to your messages or even acknowledge that they occurred.
2. Only data. In this opt, your messages will go to the AI, so the AI will read your messages, but the bot won't actually do anything to you. You will not get reactions to messages, and the bot will not otherwise interact with you unless you interact with it.
3. Data + reactions. In this opt, the things that happen in 'only data' will happen, but the bot *will* react to your messages. Every message you send in any channel where (1) the bot is in the channel and (2) the channel creator has allowed this bot to run in this channel will be reacted to with either a normal chess emoji or, rarely, a MAGICAL chess emoji. When you get reacted to with a magical chess emoji, you get a magical power up. While opted in to data + reactions, you can use the -use-magic command to activate the power up.
4. Everything. This opt is very similar to the one above with one **VERY IMPORTANT** difference. Instead of just reacting to your messages, the bot will also send you a message explaining its reasoning EVERY time you send something. Note: this can *really* clutter up your Slack channels, and I don't really suggest opting in this much.

#### /mchessemojis-channel-opt-in
This command is only for the creator of a channel. If you run this command and you are *not* the creator of the channel, the command will give you a failure message and not do anything. However, if you are the creator of the channel, then this bot will become opted in to the channel. If the channel was already opted in, you will get a message telling you that the channel is already opted in. If the channel *wasn't* already opted in, however, the bot will post a public message in the channel that you opted the channel in. Note: the bot still can't do anything unless (1) the bot is IN the channel and (2) a given user is opted in.

#### /mchessemojis-channel-opt-out
This command is exactly as the same as /mchessemojis-channel-opt-in except that it opts the bot out. Only the creator of the channel can use it, and only if the bot was already opted in will the bot post a public message that the bot was opted out. Note: this has no effect if (1) the bot is NOT in the channel or (2) on users who were not opted in in the first place.

#### /mchessemojis-use-magic
This command lets you use magic earned by getting magical chess emoji reactions. You can only use this command if you are currently opted in to at least data + reactions. Most magic, when used, stays active until other messages are posted. NOTE: AS OF NOW, THE ONLY MAGIC POWER UPS THAT WORK ARE `critical-move` AND `fast-win-move`, SO USING ANY OTHER POWER UPS WILL RESULT IN BEING COMPLETELY UNABLE TO USE ANY OTHER MAGIC. If this happens, DM @lraj23 or send a message in #lraj23-bot-testing.

#### /mchessemojis-help
This command gives you help with this bot. Um don't run this command it literally redirects you to this readme where there's more information.

### Links, Channels, etc.

The dedicated channel for testing this bot is [#lraj23-bot-testing](https://hackclub.slack.com/archives/C09GR27104V). The GitHub repo is literally [right here](https://github.com/lraj23/magical-chess-emojis). My Hackatime project for this bot is called magical-chess-emojis.
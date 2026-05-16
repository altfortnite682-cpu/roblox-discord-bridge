const express = require('express');
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');

const app = express();
app.use(express.json());

let currentCommand = { action: "idle" };

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    const args = message.content.split(' ');
    const command = args[0].toLowerCase();

    // Help Menu Update
    if (command === '!commands') {
        const helpEmbed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('🤖 Advanced Roblox Bot Controller')
            .addFields(
                { name: '`!walk <direction>`', value: 'forward, backward, left, right' },
                { name: '`!chat <text>`', value: 'Makes the bot say text visibly.' },
                { name: '`!emote <ID>`', value: 'Plays a Roblox animation ID.' },
                { name: '`!rig <r6/r15>`', value: 'Switches the bot model type.' },
                { name: '`!shirt <ID>` / `!pants <ID>`', value: 'Applies clothing asset IDs.' },
                { name: '`!run <action>`', value: 'Runs a built-in function (e.g., dance, custom).' }
            );
        return message.reply({ embeds: [helpEmbed] });
    }

    if (command === '!walk') {
        const dir = args[1]?.toLowerCase();
        if (!['forward', 'backward', 'left', 'right'].includes(dir)) return message.reply("❌ Invalid direction.");
        currentCommand = { action: "walk", direction: dir };
        return message.reply(`🏃 Bot walking ${dir}.`);
    }
    else if (command === '!chat') {
        const msg = args.slice(1).join(' ');
        if (!msg) return message.reply("❌ Provide a message.");
        currentCommand = { action: "chat", message: msg };
        return message.reply(`💬 Sent chat message.`);
    }
    else if (command === '!emote') {
        if (!args[1] || isNaN(args[1])) return message.reply("❌ Provide an Animation ID.");
        currentCommand = { action: "emote", id: args[1] };
        return message.reply(`🎭 Playing animation ID: ${args[1]}`);
    }
    else if (command === '!rig') {
        const rigType = args[1]?.toLowerCase();
        if (rigType !== 'r6' && rigType !== 'r15') return message.reply("❌ Use `!rig r6` or `!rig r15`.");
        currentCommand = { action: "rig", type: rigType };
        return message.reply(`🔄 Switching rig to ${rigType.toUpperCase()}...`);
    }
    else if (command === '!shirt' || command === '!pants') {
        if (!args[1] || isNaN(args[1])) return message.reply("❌ Provide a valid asset ID.");
        currentCommand = { action: command.replace('!', ''), id: args[1] };
        return message.reply(`👕 Updating appearance...`);
    }
    else if (command === '!run') {
        const actionName = args[1]?.toLowerCase();
        if (!actionName) return message.reply("❌ Specify a function to run.");
        currentCommand = { action: "run", target: actionName };
        return message.reply(`⚡ Running pre-set function: ${actionName}`);
    }
});

app.get('/get-command', (req, res) => {
    res.json(currentCommand);
    if (currentCommand.action !== "idle") currentCommand = { action: "idle" };
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🌐 Live on port ${PORT}`));
if (DISCORD_TOKEN) client.login(DISCORD_TOKEN);

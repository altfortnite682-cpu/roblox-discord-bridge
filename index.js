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

    // 1. VIEW COMMANDS LIST
    if (command === '!commands') {
        const helpEmbed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('🤖 Roblox Bot Controller Commands')
            .setDescription('Use these commands to control the live in-game humanoid:')
            .addFields(
                { name: '`!commands`', value: 'Displays this list.' },
                { name: '`!walk <forward/backward/left/right>`', value: 'Moves the bot a few studs in a relative direction.' },
                { name: '`!move <X> <Y> <Z>`', value: 'Moves the bot to exact map coordinates.' },
                { name: '`!follow <Username>`', value: 'Tracks a player and copies basic actions (like jumping).' },
                { name: '`!unfollow`', value: 'Stops following a player.' },
                { name: '`!chat <Text>`', value: 'Makes the bot speak out loud.' },
                { name: '`!jump`', value: 'Forces the bot to jump.' },
                { name: '`!shirt <ID>` / `!pants <ID>`', value: 'Changes clothes using a Roblox clothing catalog ID.' }
            );

        return message.reply({ embeds: [helpEmbed] });
    }

    // 2. DIRECTIONAL RELATIVE MOVEMENT
    if (command === '!walk') {
        const direction = args[1]?.toLowerCase();
        if (!['forward', 'backward', 'left', 'right'].includes(direction)) {
            return message.reply("❌ Invalid direction! Use: `!walk forward`, `!walk backward`, `!walk left`, or `!walk right`.");
        }
        currentCommand = { action: "walk", direction: direction };
        return message.reply(`🏃 Bot is walking **${direction}**.`);
    }

    // Retaining standard commands from previous version
    if (command === '!move') {
        const x = parseFloat(args[1]), y = parseFloat(args[2]), z = parseFloat(args[3]);
        if (isNaN(x) || isNaN(y) || isNaN(z)) return message.reply("❌ Use: `!move X Y Z`");
        currentCommand = { action: "move", x, y, z };
        message.reply(`🎯 Manual move coordinate sent.`);
    }
    else if (command === '!chat') {
        const msg = args.slice(1).join(' ');
        if (!msg) return message.reply("❌ Use: `!chat <text>`");
        currentCommand = { action: "chat", message: msg };
    }
    else if (command === '!jump') {
        currentCommand = { action: "jump" };
    }
    else if (command === '!follow') {
        if (!args[1]) return message.reply("❌ Use: `!follow <Username>`");
        currentCommand = { action: "follow", player: args[1] };
        message.reply(`👀 Following and copying actions of **${args[1]}**.`);
    }
    else if (command === '!unfollow') {
        currentCommand = { action: "unfollow" };
    }
    else if (command === '!shirt' || command === '!pants') {
        if (!args[1] || isNaN(args[1])) return message.reply("❌ Specify a numeric Asset ID.");
        currentCommand = { action: command.replace('!', ''), id: args[1] };
    }
});

app.get('/get-command', (req, res) => {
    res.json(currentCommand);
    if (currentCommand.action !== "idle" && currentCommand.action !== "follow") {
        currentCommand = { action: "idle" };
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🌐 Server running on port ${PORT}`));
if (DISCORD_TOKEN) client.login(DISCORD_TOKEN);

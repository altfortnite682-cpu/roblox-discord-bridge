const express = require('express');
const { Client, GatewayIntentBits } = require('discord.js');

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

client.on('ready', () => {
    console.log(`🤖 Discord bridge bot is online as ${client.user.tag}!`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    const args = message.content.split(' ');
    const command = args[0].toLowerCase();

    // 1. MOVE COMMAND (!move X Y Z)
    if (command === '!move') {
        const x = parseFloat(args[1]);
        const y = parseFloat(args[2]);
        const z = parseFloat(args[3]);
        if (isNaN(x) || isNaN(y) || isNaN(z)) return message.reply("❌ Use: `!move X Y Z`");
        
        currentCommand = { action: "move", x, y, z };
        message.reply(`🏃 **Moving** to coordinates: (${x}, ${y}, ${z})`);
    }

    // 2. CHAT COMMAND (!chat Hello World)
    else if (command === '!chat') {
        const chatMessage = args.slice(1).join(' ');
        if (!chatMessage) return message.reply("❌ Use: `!chat <message>`");

        currentCommand = { action: "chat", message: chatMessage };
        message.reply(`💬 Bot will say: "${chatMessage}"`);
    }

    // 3. JUMP COMMAND (!jump)
    else if (command === '!jump') {
        currentCommand = { action: "jump" };
        message.reply("🦘 Bot is **jumping**!");
    }

    // 4. FOLLOW COMMAND (!follow PlayerName)
    else if (command === '!follow') {
        const targetPlayer = args[1];
        if (!targetPlayer) return message.reply("❌ Use: `!follow <Username>`");

        currentCommand = { action: "follow", player: targetPlayer };
        message.reply(`👀 Now **following**: ${targetPlayer}`);
    }

    // 5. UNFOLLOW COMMAND (!unfollow)
    else if (command === '!unfollow') {
        currentCommand = { action: "unfollow" };
        message.reply("🛑 Stopped following.");
    }

    // 6. CLOTHES COMMAND (!shirt ID or !pants ID)
    else if (command === '!shirt' || command === '!pants') {
        const assetId = args[1];
        if (!assetId || isNaN(assetId)) return message.reply(`❌ Use: \`${command} <AssetID>\``);

        currentCommand = { action: command.replace('!', ''), id: assetId };
        message.reply(`👕 Changing **${command.replace('!', '')}** to Asset ID: ${assetId}`);
    }
});

app.get('/get-command', (req, res) => {
    res.json(currentCommand);
    if (currentCommand.action !== "idle" && currentCommand.action !== "follow") {
        currentCommand = { action: "idle" }; // Keep "follow" active until cancelled
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🌐 Listening on port ${PORT}`));

if (DISCORD_TOKEN) client.login(DISCORD_TOKEN);

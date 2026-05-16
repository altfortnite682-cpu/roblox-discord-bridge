const express = require('express');
const { Client, GatewayIntentBits } = require('discord.js');

const app = express();
app.use(express.json());

// Memory storage for the active bot command
let currentCommand = { action: "idle" };

// --- DISCORD BOT SETUP ---
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Pulls your secret token securely from Render's Environment Variables
const DISCORD_TOKEN = process.env.DISCORD_TOKEN; 

client.on('ready', () => {
    console.log(`🤖 Discord bridge bot is online as ${client.user.tag}!`);
});

client.on('messageCreate', async (message) => {
    // Ignore messages from other bots
    if (message.author.bot) return;

    // Command structure: !move X Y Z
    if (message.content.startsWith('!move')) {
        const args = message.content.split(' ');
        const x = parseFloat(args[1]);
        const y = parseFloat(args[2]);
        const z = parseFloat(args[3]);

        // Validation check for coordinates
        if (isNaN(x) || isNaN(y) || isNaN(z)) {
            return message.reply("❌ **Error:** Please provide valid numbers. Example: `!move 15 5 -30` ");
        }

        // Store the command so Roblox can grab it
        currentCommand = { action: "move", x: x, y: y, z: z };
        message.reply(`📥 **Command Buffered:** Moving the Roblox bot to coordinates: **(${x}, ${y}, ${z})**`);
    }
});

// --- ROBLOX API ENDPOINT ---

// This is the private URL your Roblox script will constantly check
app.get('/get-command', (req, res) => {
    res.json(currentCommand);
    
    // Reset back to idle after sending it so the bot doesn't keep looping the same movement
    if (currentCommand.action !== "idle") {
        currentCommand = { action: "idle" };
    }
});

// Start the web server on Render's required port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🌐 Web server listening on port ${PORT}`);
});

// Log the bot into Discord
if (DISCORD_TOKEN) {
    client.login(DISCORD_TOKEN);
} else {
    console.error("❌ ERROR: 'DISCORD_TOKEN' variable is missing in your hosting environment variables!");
}

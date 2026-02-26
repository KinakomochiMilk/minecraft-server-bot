const { Client, GatewayIntentBits, EmbedBuilder, SlashCommandBuilder, Routes } = require('discord.js');
const { REST } = require('@discordjs/rest');
const http = require('http');

// --- Renderスリープ防止 ---
http.createServer((req, res) => {
  res.write("Bot is running");
  res.end();
}).listen(process.env.PORT || 8080);

// --- 設定 (IDなどは適宜書き換えてください) ---
const CONFIG = {
    TOKEN: process.env.DISCORD_TOKEN, 
    CLIENT_ID: '1466710644689469481',
    STATUS_CHANNEL_ID: '1476147186818351218', 
    NOTIFICATION_CHANNEL_ID: '1461696061780263137', 
};

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

// --- ステータス表示の更新関数 ---
async function refreshStatusDisplay(comment = "Aternosで稼働中です") {
    try {
        const channel = await client.channels.fetch(CONFIG.STATUS_CHANNEL_ID);
        if (!channel) return;
        
        const statusEmbed = new EmbedBuilder()
            .setTitle("🟢 サーバー稼働状況")
            .setColor(0x00FF00)
            .addFields(
                { name: 'ステータス', value: '✅ Aternosで管理中', inline: false },
                { name: '📢 お知らせ', value: `\`\`\`${comment}\`\`\`` }
            )
            .setTimestamp();
        
        await channel.send({ embeds: [statusEmbed] });
    } catch (err) { console.error("更新失敗:", err); }
}

client.once('ready', async () => {
    // スラッシュコマンドの登録
    const commands = [
        new SlashCommandBuilder().setName('status_update').setDescription('ステータス表示を更新する')
    ].map(c => c.toJSON());

    const rest = new REST({ version: '10' }).setToken(CONFIG.TOKEN);
    await rest.put(Routes.applicationCommands(CONFIG.CLIENT_ID), { body: commands });
    
    console.log(`✅ ${client.user.tag} Online (Aternos連携用)`);
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    if (interaction.commandName === 'status_update') {
        await refreshStatusDisplay();
        await interaction.reply("ステータスを更新しました！");
    }
});

client.login(CONFIG.TOKEN);

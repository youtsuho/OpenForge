
const { Events, EmbedBuilder } = require('discord.js');

module.exports = {
    name: Events.GuildCreate,
    async execute(guild) {
        const client = guild.client;
        const channelId = '1449792450481623053';
        const channel = client.channels.cache.get(channelId);

        if (!channel) return console.warn(`[GUILD CREATE] Impossible de trouver le salon log ${channelId}`);

        try {
            const serverCount = client.guilds.cache.size;
            
            const welcomeEmbed = new EmbedBuilder()
                .setColor(0xFF5733) // Couleur orange Forge
                .setDescription(`<:OpenForge:1452088725202010263> Merci de m'avoir ajouté, je suis désormais sur **${serverCount}** serveurs.`)
                .setTimestamp();

            await channel.send({ embeds: [welcomeEmbed] });
            console.log(`✅ Message de bienvenue (Embed) envoyé pour l'ajout sur le serveur : ${guild.name}`);
        } catch (error) {
            console.error(`❌ Erreur lors de l'envoi de l'embed de bienvenue dans le salon de logs :`, error);
        }
    },
};

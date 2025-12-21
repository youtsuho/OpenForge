const { Events, EmbedBuilder } = require('discord.js');
const { pool } = require('../../db');

module.exports = {
    name: Events.GuildMemberRemove,
    async execute(member) {
        console.log(`🏃 Membre parti : ${member.user.tag} de ${member.guild.name}.`);

        try {
            const [rows] = await pool.execute('SELECT * FROM leave_settings WHERE guild_id = ? AND enabled = 1', [member.guild.id]);
            
            if (rows.length === 0) return;
            const config = rows[0];

            if (!config.channel_id) return;

            const channel = member.guild.channels.cache.get(config.channel_id);
            if (!channel) return;

            const replacePlaceholders = (text) => {
                if (!text) return "";
                return text
                    .replace(/{user}/g, member.user.tag)
                    .replace(/{username}/g, member.user.username)
                    .replace(/{server}/g, member.guild.name)
                    .replace(/{memberCount}/g, member.guild.memberCount.toString());
            };

            const embed = new EmbedBuilder()
                .setTitle(replacePlaceholders(config.title))
                .setDescription(replacePlaceholders(config.description))
                .setColor(config.color)
                .setFooter({ text: replacePlaceholders(config.footer) })
                .setTimestamp();

            if (config.thumbnail) embed.setThumbnail(config.thumbnail);
            if (config.image) embed.setImage(config.image);

            await channel.send({ content: `**${member.user.username}** nous a quittés...`, embeds: [embed] });

        } catch (error) {
            console.error('Erreur lors du traitement du message de départ (SQL) :', error);
        }
    },
};
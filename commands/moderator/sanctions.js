const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, time } = require('discord.js');
const { pool } = require('../../db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sanctions')
        .setDescription(' 📜  Voir les sanctions d\'un utilisateur ou les dernières sanctions du serveur.')
        .addUserOption(option => option.setName('cible').setDescription('L\'utilisateur à inspecter'))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .setDMPermission(false),

    async execute(interaction) {
        const target = interaction.options.getUser('cible');
        const guildId = interaction.guild.id;

        let query, params, title;

        if (target) {
            query = 'SELECT * FROM sanctions WHERE guild_id = ? AND user_id = ? ORDER BY timestamp DESC LIMIT 20';
            params = [guildId, target.id];
            title = `📜 Historique de ${target.username}`;
        } else {
            query = 'SELECT * FROM sanctions WHERE guild_id = ? ORDER BY timestamp DESC LIMIT 10';
            params = [guildId];
            title = `📋 Dernières sanctions du serveur`;
        }

        const [rows] = await pool.execute(query, params);

        if (rows.length === 0) {
            const emptyEmbed = new EmbedBuilder()
                .setColor(0x3498db)
                .setDescription("ℹ️ Aucune sanction trouvée dans la base de données.");
            return interaction.reply({ embeds: [emptyEmbed], ephemeral: true });
        }

        const embed = new EmbedBuilder()
            .setTitle(title)
            .setColor(0x3498db)
            .setTimestamp();

        const description = rows.map(row => {
            const typeEmoji = { 
                'WARN': '⚠️', 
                'MUTE': '🔇', 
                'UNMUTE': '🔊', 
                'KICK': '👞', 
                'BAN': '🚫', 
                'UNBAN': '🔓' 
            }[row.type] || '📝';
            
            return `**#${row.id}** [${typeEmoji} ${row.type}] <@${row.user_id}> par <@${row.moderator_id}>\n└ *${row.reason}* - ${time(row.timestamp, 'R')}`;
        }).join('\n\n');

        embed.setDescription(description.slice(0, 4000));

        await interaction.reply({ embeds: [embed] });
    },
};
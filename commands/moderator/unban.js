const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { pool } = require('../../db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unban')
        .setDescription(' 🔓  Débannir un utilisateur.')
        .addStringOption(option => option.setName('id').setDescription('L\'ID de l\'utilisateur à débannir').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .setDMPermission(false),

    async execute(interaction) {
        const userId = interaction.options.getString('id');

        try {
            const ban = await interaction.guild.bans.fetch(userId).catch(() => null);

            if (!ban) {
                const errEmbed = new EmbedBuilder().setColor(0xe74c3c).setDescription("❌ Cet utilisateur n'est pas banni de ce serveur.");
                return interaction.reply({ embeds: [errEmbed], ephemeral: true });
            }

            await interaction.guild.members.unban(userId);

            const [result] = await pool.execute(
                'INSERT INTO sanctions (guild_id, user_id, moderator_id, type, reason) VALUES (?, ?, ?, ?, ?)',
                [interaction.guild.id, userId, interaction.user.id, 'UNBAN', 'Débannissement manuel']
            );

            const successEmbed = new EmbedBuilder()
                .setTitle('🔓 Utilisateur Débanni')
                .setColor(0x2ecc71)
                .setDescription(`L'utilisateur **${ban.user.tag}** (\`${userId}\`) a été débanni.`)
                .addFields({ name: 'Cas de log', value: `#${result.insertId}`, inline: true });

            await interaction.reply({ embeds: [successEmbed] });
        } catch (error) {
            console.error(error);
            const errorEmbed = new EmbedBuilder().setColor(0xe74c3c).setDescription('❌ Impossible de débannir cet utilisateur. Vérifiez l\'ID.');
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    },
};
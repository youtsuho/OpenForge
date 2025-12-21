const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ChannelType } = require('discord.js');
const { pool } = require('../../db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket-config')
        .setDescription(' ⚙️  Configure les paramètres système des tickets.')
        .addChannelOption(option => option.setName('categorie').setDescription('La catégorie où les tickets seront créés').addChannelTypes(ChannelType.GuildCategory).setRequired(true))
        .addRoleOption(option => option.setName('role_support').setDescription('Le rôle qui pourra voir et répondre aux tickets').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDMPermission(false),

    async execute(interaction) {
        const category = interaction.options.getChannel('categorie');
        const role = interaction.options.getRole('role_support');
        const guildId = interaction.guild.id;

        try {
            await pool.execute(`INSERT INTO ticket_settings (guild_id, category_id, staff_role_id) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE category_id = VALUES(category_id), staff_role_id = VALUES(staff_role_id)`, [guildId, category.id, role.id]);
            const embed = new EmbedBuilder().setTitle('⚙️ Configuration Tickets Mise à Jour').setColor(0x2ecc71).addFields({ name: 'Catégorie', value: `${category.name}`, inline: true }, { name: 'Rôle Support', value: `${role.name}`, inline: true }).setTimestamp();
            await interaction.reply({ embeds: [embed], ephemeral: true });
        } catch (error) {
            const errEmbed = new EmbedBuilder().setColor(0xe74c3c).setDescription('❌ Erreur lors de la sauvegarde de la configuration.');
            await interaction.reply({ embeds: [errEmbed], ephemeral: true });
        }
    },
};
const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket-setup')
        .setDescription(' 🎫  Envoie le message permettant d\'ouvrir un ticket.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDMPermission(false),

    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle('🎫 Support & Assistance')
            .setDescription('Besoin d\'aide ? Cliquez sur le bouton ci-dessous pour ouvrir un ticket privé.')
            .setColor(0x5865F2)
            .setFooter({ text: 'OpenForge Support System' });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('ticket_open').setLabel('Ouvrir un ticket').setEmoji('📩').setStyle(ButtonStyle.Primary)
        );

        await interaction.channel.send({ embeds: [embed], components: [row] });
        const successEmbed = new EmbedBuilder().setColor(0x2ecc71).setDescription('✅ Le système de ticket a été déployé dans ce salon.');
        await interaction.reply({ embeds: [successEmbed], ephemeral: true });
    },
};
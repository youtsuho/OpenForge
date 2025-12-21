const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unlock')
        .setDescription(' 🔓  Déverrouiller le salon')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
        .setDMPermission(false),
    async execute(interaction) {
        try {
            // On remet la permission à null pour utiliser le réglage par défaut du serveur/catégorie
            await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
                SendMessages: null
            });

            const embed = new EmbedBuilder()
                .setTitle('🔓 Salon Déverrouillé')
                .setDescription('Le salon a été déverrouillé par un membre du personnel. Les membres peuvent à nouveau envoyer des messages.')
                .setColor(0x2ecc71)
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: "❌ Impossible de déverrouiller ce salon. Vérifiez mes permissions.", ephemeral: true });
        }
    },
};
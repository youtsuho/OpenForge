const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('lock')
        .setDescription(' 🔒  Verrouiller le salon')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
        .setDMPermission(false),
    async execute(interaction) {
        try {
            await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
                SendMessages: false
            });

            const embed = new EmbedBuilder()
                .setTitle('🔒 Salon Verrouillé')
                .setDescription('Le salon a été verrouillé par un membre du personnel. Personne ne peut plus envoyer de messages ici pour le moment.')
                .setColor(0xe74c3c)
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: "❌ Impossible de verrouiller ce salon. Vérifiez mes permissions.", ephemeral: true });
        }
    },
};
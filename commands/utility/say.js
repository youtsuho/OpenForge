const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('say')
        .setDescription(' 💬  Fait répéter un message par le bot.')
        .addStringOption(option => option.setName('message').setDescription('Le message à envoyer').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages),

    async execute(interaction) {
        const messageContent = interaction.options.getString('message');
        await interaction.channel.send(messageContent);

        const confirmEmbed = new EmbedBuilder()
            .setColor(0x2ecc71)
            .setDescription('✅ Votre message a été diffusé.');

        await interaction.reply({ embeds: [confirmEmbed], ephemeral: true });
    },
};
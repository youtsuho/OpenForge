const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('say')
        .setDescription('Fait répéter un message par le bot.')
        .addStringOption(option =>
            option.setName('message')
                .setDescription('Le message à envoyer')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages),
    async execute(interaction) {
        const messageContent = interaction.options.getString('message');

        // On envoie le message dans le salon où la commande a été faite
        await interaction.channel.send(messageContent);

        // On répond à l'interaction de manière invisible (ephemeral) pour confirmer
        await interaction.reply({ content: 'Message envoyé avec succès !', ephemeral: true });
    },
};
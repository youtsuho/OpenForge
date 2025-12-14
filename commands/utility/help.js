const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Affiche la liste des commandes disponibles.'),
    async execute(interaction) {
        const commands = interaction.client.commands;
        
        const embed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle('📖 Liste des commandes OpenForge')
            .setDescription('Voici toutes les commandes que je peux exécuter :')
            .setTimestamp()
            .setFooter({ text: 'OpenForge Bot' });

        commands.forEach(cmd => {
            embed.addFields({ 
                name: `/${cmd.data.name}`, 
                value: cmd.data.description || 'Pas de description.', 
                inline: false 
            });
        });

        await interaction.reply({ embeds: [embed], ephemeral: true });
    },
};

const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription(' 🧹  Supprime un nombre donné de messages dans ce salon.')
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('Le nombre de messages à supprimer (1-100)')
                .setMinValue(1)
                .setMaxValue(100)
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .setDMPermission(false),
    async execute(interaction) {
        const amount = interaction.options.getInteger('amount');

        try {
            // bulkDelete(nombre, filterOld) : true pour ignorer les messages de plus de 14 jours
            const deleted = await interaction.channel.bulkDelete(amount, true);

            const embed = new EmbedBuilder()
                .setColor(0xFF5733)
                .setDescription(`✅ **${deleted.size}** message(s) ont été supprimés avec succès.`)
                .setFooter({ text: 'Note : Les messages de plus de 14 jours ne peuvent pas être supprimés par un bot.' });

            await interaction.reply({ embeds: [embed], ephemeral: true });
        } catch (error) {
            console.error('[CLEAR ERROR]', error);
            
            // Gestion des erreurs spécifiques (ex: manque de permissions du bot lui-même)
            if (error.code === 50013) {
                return interaction.reply({ 
                    content: '❌ Je n\'ai pas la permission "Gérer les messages" pour effectuer cette action.', 
                    ephemeral: true 
                });
            }

            await interaction.reply({ 
                content: '❌ Une erreur est survenue lors de la tentative de suppression des messages.', 
                ephemeral: true 
            });
        }
    },
};
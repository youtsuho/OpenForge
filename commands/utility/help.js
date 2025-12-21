const { 
    SlashCommandBuilder, 
    EmbedBuilder, 
    ActionRowBuilder, 
    StringSelectMenuBuilder, 
    ComponentType 
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription(' 📚  Affiche la liste interactive des commandes par catégorie.'),
    
    async execute(interaction) {
        const commands = interaction.client.commands;
        
        // Configuration des noms de catégories lisibles
        const categoriesData = {
            admin: { name: 'Administration', emoji: '🛠️', description: 'Commandes de configuration serveur.' },
            moderator: { name: 'Modération', emoji: '🛡️', description: 'Outils pour gérer les membres et les salons.' },
            utility: { name: 'Utilitaires', emoji: '⚙️', description: 'Commandes pratiques et informations.' },
            fun: { name: 'Divertissement', emoji: '🎮', description: 'Commandes pour s\'amuser.' }
        };

        // Extraire les catégories présentes
        const categories = [...new Set(commands.map(cmd => cmd.category))];

        const initialEmbed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle('📖 Aide OpenForge')
            .setDescription('Bienvenue dans le centre d\'assistance. Sélectionnez une catégorie dans le menu déroulant ci-dessous pour voir les commandes disponibles.')
            .addFields({ name: 'Statistiques', value: `Total de commandes : \`${commands.size}\` répartis sur \`${categories.length}\` catégories.` })
            .setThumbnail(interaction.client.user.displayAvatarURL())
            .setFooter({ text: 'Utilisez le menu ci-dessous • OpenForge' });

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('help_select')
            .setPlaceholder('Choisissez une catégorie...')
            .addOptions(
                categories.map(cat => ({
                    label: categoriesData[cat]?.name || cat.charAt(0).toUpperCase() + cat.slice(1),
                    value: cat,
                    description: categoriesData[cat]?.description || 'Liste des commandes.',
                    emoji: categoriesData[cat]?.emoji || '📁'
                }))
            );

        const row = new ActionRowBuilder().addComponents(selectMenu);

        const response = await interaction.reply({
            embeds: [initialEmbed],
            components: [row],
            ephemeral: true
        });

        const collector = response.createMessageComponentCollector({ 
            componentType: ComponentType.StringSelect, 
            time: 300000 
        });

        collector.on('collect', async i => {
            const category = i.values[0];
            const categoryInfo = categoriesData[category];
            const categoryCommands = commands.filter(cmd => cmd.category === category);

            const categoryEmbed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle(`${categoryInfo?.emoji || '📁'} Catégorie : ${categoryInfo?.name || category}`)
                .setDescription(categoryInfo?.description || 'Voici les commandes disponibles dans cette section.')
                .addFields(
                    categoryCommands.map(cmd => ({
                        name: `/${cmd.data.name}`,
                        value: cmd.data.description || 'Pas de description.',
                        inline: false
                    }))
                )
                .setFooter({ text: `Page générée pour ${interaction.user.username}` })
                .setTimestamp();

            await i.update({ embeds: [categoryEmbed] });
        });

        collector.on('end', async () => {
            try {
                const disabledMenu = new StringSelectMenuBuilder()
                    .setCustomId('help_select_disabled')
                    .setPlaceholder('Menu expiré')
                    .addOptions({ label: 'Expiré', value: 'none' })
                    .setDisabled(true);
                
                const disabledRow = new ActionRowBuilder().addComponents(disabledMenu);
                await interaction.editReply({ components: [disabledRow] });
            } catch (e) {
                // L'interaction a peut-être été supprimée
            }
        });
    },
};
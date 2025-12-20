const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('about')
        .setDescription('Découvre l\'histoire, l\'objectif et les liens utiles d\'OpenForge.'),
    async execute(interaction) {
        
        const embed = new EmbedBuilder()
            .setColor(0xFF5733) // Une couleur "Forge" (Orange/Rouge) ou le bleu standard
            .setTitle('🔥 À propos d\'OpenForge')
            .setDescription("OpenForge n'est pas un bot comme les autres. C'est une **aventure collaborative**.")
            .addFields(
                {
                    name: '🤖 C\'est quoi ce bot ?',
                    value: "OpenForge est un bot **Open Source** développé par la communauté, pour la communauté. Il n'appartient pas à une seule personne, mais à tous ceux qui contribuent à son code."
                },
                {
                    name: '🎯 Quel est l\'objectif ?',
                    value: "L'idée est de créer un terrain d'apprentissage et de partage. Que tu sois débutant ou expert, tu peux proposer des fonctionnalités, corriger des bugs et voir ton code utilisé sur des centaines de serveurs."
                },
                {
                    name: '🌐 Pourquoi est-il public sur GitHub ?',
                    value: "Pour la **transparence** totale et l'éducation. Tout le monde peut voir comment le bot fonctionne, s'en inspirer pour ses propres projets, ou améliorer la sécurité et les fonctionnalités d'OpenForge."
                }
            )
            .setFooter({ text: 'OpenForge • Le bot forgé par vous.', iconURL: interaction.client.user.displayAvatarURL() });

        // Création des boutons
        const inviteButton = new ButtonBuilder()
            .setLabel('Ajouter sur mon serveur')
            .setEmoji('🚀')
            .setStyle(ButtonStyle.Link)
            .setURL('https://discord.com/oauth2/authorize?client_id=1449792004128116857');

        const githubButton = new ButtonBuilder()
            .setLabel('Voir le Code (GitHub)')
            .setEmoji('💻')
            .setStyle(ButtonStyle.Link)
            .setURL('https://github.com/youtsuho/OpenForge');

        const issueButton = new ButtonBuilder()
            .setLabel('Signaler un bug / Idée')
            .setEmoji('🐛')
            .setStyle(ButtonStyle.Link)
            .setURL('https://github.com/youtsuho/OpenForge/issues');

        // Ajout des boutons dans une ligne d'action
        const row = new ActionRowBuilder()
            .addComponents(inviteButton, githubButton, issueButton);

        await interaction.reply({ embeds: [embed], components: [row] });
    },
};
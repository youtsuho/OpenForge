const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('avatar')
        .setDescription(" 🖼️  Affiche la photo de profil d'un utilisateur.")
        .addUserOption(option =>
            option.setName('target')
                .setDescription("L'utilisateur dont vous voulez voir l'avatar")
                .setRequired(false)),
    async execute(interaction) {
        // On récupère l'utilisateur mentionné, sinon l'auteur de la commande
        const user = interaction.options.getUser('target') || interaction.user;
        
        // URL de l'avatar en haute résolution (4096px)
        const avatarUrl = user.displayAvatarURL({ size: 4096 });

        const embed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle(`🖼️ Avatar de ${user.username}`)
            .setImage(avatarUrl)
            .setFooter({ 
                text: `Demandé par ${interaction.user.tag}`, 
                iconURL: interaction.user.displayAvatarURL() 
            });

        // Bouton pour ouvrir l'image dans le navigateur
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setLabel('Ouvrir l\'image originale')
                .setStyle(ButtonStyle.Link)
                .setURL(avatarUrl)
        );

        await interaction.reply({ embeds: [embed], components: [row] });
    },
};
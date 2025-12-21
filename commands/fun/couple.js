const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('couple')
        .setDescription(' 💘  Trouver le couple parfait et tester leur compatibilité.')
        .addUserOption(option => 
            option.setName('user1')
                .setDescription('Le premier utilisateur')
                .setRequired(true))
        .addUserOption(option => 
            option.setName('user2')
                .setDescription('Le deuxième utilisateur')
                .setRequired(true)),
    async execute(interaction) {
        const u1 = interaction.options.getUser('user1');
        const u2 = interaction.options.getUser('user2');

        // Génération d'un pourcentage aléatoire
        const lovePercentage = Math.floor(Math.random() * 101);

        // Détermination du message et de la couleur selon le score
        let status = "";
        let color = '#FF69B4'; // Rose par défaut

        if (lovePercentage > 90) {
            status = "💞 **C'est le coup de foudre absolu ! Un match parfait !**";
            color = '#FF0000'; // Rouge passion
        } else if (lovePercentage > 70) {
            status = "❤️ **Une très belle alchimie. C'est du sérieux !**";
        } else if (lovePercentage > 50) {
            status = "🧡 **Il y a du potentiel, mais il faudra faire des efforts !**";
        } else if (lovePercentage > 30) {
            status = "💛 **Pourquoi pas... sur un malentendu, ça peut marcher ?**";
        } else {
            status = "💔 **Mieux vaut rester bons amis... ou ne pas se croiser.**";
            color = '#808080'; // Gris
        }

        // Création d'une barre de progression visuelle (10 segments)
        const filledSegments = Math.round(lovePercentage / 10);
        const emptySegments = 10 - filledSegments;
        const progressBar = "❤️".repeat(filledSegments) + "🖤".repeat(emptySegments);

        const embed = new EmbedBuilder()
            .setTitle('💘 Test de Compatibilité')
            .setColor(color)
            .setThumbnail('https://cdn-icons-png.flaticon.com/512/2589/2589175.png')
            .setDescription(`Voyons si **${u1.username}** et **${u2.username}** sont faits l'un pour l'autre...\n\n` +
                            `**Score : ${lovePercentage}%**\n` +
                            `${progressBar}\n\n` +
                            `${status}`)
            .setFooter({ text: `Test effectué par ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
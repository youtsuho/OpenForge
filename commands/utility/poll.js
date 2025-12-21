const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('poll')
        .setDescription(' 📊  Créer un sondage')
        .addStringOption(option => 
            option.setName('question')
                .setDescription('La question du sondage')
                .setRequired(true)),
    async execute(interaction) {
        const question = interaction.options.getString('question');

        const embed = new EmbedBuilder()
            .setTitle('📊 Nouveau Sondage')
            .setDescription(question)
            .setColor(0x00a8ff)
            .setFooter({ text: `Sondage lancé par ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp();

        const message = await interaction.reply({ embeds: [embed], fetchReply: true });
        
        try {
            await message.react('👍');
            await message.react('👎');
        } catch (error) {
            console.error('Erreur lors des réactions au sondage:', error);
        }
    },
};
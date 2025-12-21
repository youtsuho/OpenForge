const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remind')
        .setDescription(' ⏰  Créer un rappel.')
        .addStringOption(option => option.setName('time').setDescription('Temps (ex: 10s, 5m, 1h)').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('Le sujet du rappel').setRequired(false)),

    async execute(interaction) {
        const timeInput = interaction.options.getString('time');
        const reason = interaction.options.getString('reason') || 'Aucune raison spécifiée';
        
        const timeValue = parseInt(timeInput);
        const unit = timeInput.slice(-1).toLowerCase();
        let milliseconds = 0;

        if (unit === 's') milliseconds = timeValue * 1000;
        else if (unit === 'm') milliseconds = timeValue * 60 * 1000;
        else if (unit === 'h') milliseconds = timeValue * 60 * 60 * 1000;
        else if (unit === 'd') milliseconds = timeValue * 24 * 60 * 60 * 1000;
        else {
            const errEmbed = new EmbedBuilder().setColor(0xe74c3c).setDescription("❌ Format invalide. Utilisez `s`, `m`, `h` ou `d`.");
            return interaction.reply({ embeds: [errEmbed], ephemeral: true });
        }

        const setupEmbed = new EmbedBuilder()
            .setTitle('⏰ Rappel Programmé')
            .setDescription(`Je vous rappellerai : **${reason}** dans **${timeInput}**.`)
            .setColor(0xf1c40f);

        await interaction.reply({ embeds: [setupEmbed], ephemeral: true });

        setTimeout(async () => {
            const reminderEmbed = new EmbedBuilder()
                .setTitle('🔔 Rappel !')
                .setDescription(`Il est temps ! Voici votre rappel : **${reason}**`)
                .setColor(0xf1c40f)
                .setTimestamp();

            try {
                await interaction.user.send({ embeds: [reminderEmbed] });
            } catch (e) {
                await interaction.channel.send({ content: `${interaction.user}`, embeds: [reminderEmbed] });
            }
        }, milliseconds);
    },
};
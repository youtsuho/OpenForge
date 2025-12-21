const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { pool } = require('../../db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unmute')
        .setDescription(' 🔊  Retire le mute d\'un membre.')
        .addUserOption(option => option.setName('cible').setDescription('Le membre à unmute').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .setDMPermission(false),

    async execute(interaction) {
        const target = interaction.options.getMember('cible');

        if (!target) {
            const errEmbed = new EmbedBuilder().setColor(0xe74c3c).setDescription("❌ Utilisateur non trouvé ou absent du serveur.");
            return interaction.reply({ embeds: [errEmbed], ephemeral: true });
        }

        if (!target.communicationDisabledUntilTimestamp) {
            const errEmbed = new EmbedBuilder().setColor(0xe74c3c).setDescription(`❌ **${target.user.tag}** n'est pas mute.`);
            return interaction.reply({ embeds: [errEmbed], ephemeral: true });
        }

        try {
            await target.timeout(null);

            const [result] = await pool.execute(
                'INSERT INTO sanctions (guild_id, user_id, moderator_id, type, reason) VALUES (?, ?, ?, ?, ?)',
                [interaction.guild.id, target.id, interaction.user.id, 'UNMUTE', 'Unmute manuel via commande']
            );

            const dmEmbed = new EmbedBuilder()
                .setTitle('🔊 Sanction Retirée')
                .setDescription(`Votre mute sur le serveur **${interaction.guild.name}** a été levé.`)
                .setColor(0x2ecc71)
                .setTimestamp();

            try { await target.send({ embeds: [dmEmbed] }); } catch (e) {}

            const successEmbed = new EmbedBuilder()
                .setTitle('🔊 Utilisateur Unmute')
                .setColor(0x2ecc71)
                .setDescription(`Le mute de **${target.user.tag}** a été retiré.`)
                .addFields({ name: 'Cas de log', value: `#${result.insertId}`, inline: true });

            await interaction.reply({ embeds: [successEmbed] });
        } catch (error) {
            console.error(error);
            const errorEmbed = new EmbedBuilder().setColor(0xe74c3c).setDescription('❌ Une erreur est survenue lors de la tentative d\'unmute.');
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    },
};
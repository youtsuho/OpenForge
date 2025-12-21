const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { pool } = require('../../db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mute')
        .setDescription(' 🔇  Mute temporairement un membre.')
        .addUserOption(option => option.setName('cible').setDescription('Le membre à mute').setRequired(true))
        .addIntegerOption(option => option.setName('duree').setDescription('Durée en minutes').setRequired(true).setMinValue(1).setMaxValue(40320))
        .addStringOption(option => option.setName('raison').setDescription('La raison du mute').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .setDMPermission(false),

    async execute(interaction) {
        const target = interaction.options.getMember('cible');
        const minutes = interaction.options.getInteger('duree');
        const reason = interaction.options.getString('raison');

        if (!target) {
            const errEmbed = new EmbedBuilder().setColor(0xe74c3c).setDescription("❌ Utilisateur non trouvé.");
            return interaction.reply({ embeds: [errEmbed], ephemeral: true });
        }
        if (!target.moderatable) {
            const errEmbed = new EmbedBuilder().setColor(0xe74c3c).setDescription("❌ Je ne peux pas mute cet utilisateur.");
            return interaction.reply({ embeds: [errEmbed], ephemeral: true });
        }

        const dmEmbed = new EmbedBuilder()
            .setTitle('🔇 Sanction : Mute')
            .setDescription(`Vous avez été réduit au silence sur **${interaction.guild.name}** pour **${minutes} minutes**.`)
            .addFields({ name: 'Raison', value: reason })
            .setColor(0xe67e22)
            .setTimestamp();

        try { await target.send({ embeds: [dmEmbed] }); } catch (e) {}

        await target.timeout(minutes * 60 * 1000, reason);

        const [result] = await pool.execute(
            'INSERT INTO sanctions (guild_id, user_id, moderator_id, type, reason) VALUES (?, ?, ?, ?, ?)',
            [interaction.guild.id, target.id, interaction.user.id, 'MUTE', `${reason} (${minutes}m)`]
        );

        const successEmbed = new EmbedBuilder()
            .setTitle('🔇 Utilisateur Mute')
            .setColor(0x2ecc71)
            .setDescription(`**${target.user.tag}** a été mute pour **${minutes}m**.`)
            .addFields(
                { name: 'Cas', value: `#${result.insertId}`, inline: true },
                { name: 'Raison', value: reason, inline: true }
            );

        await interaction.reply({ embeds: [successEmbed] });
    },
};
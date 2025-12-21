const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { pool } = require('../../db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription(' 👞  Expulser un membre du serveur.')
        .addUserOption(option => option.setName('cible').setDescription('Le membre à expulser').setRequired(true))
        .addStringOption(option => option.setName('raison').setDescription('La raison de l\'expulsion').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
        .setDMPermission(false),

    async execute(interaction) {
        const target = interaction.options.getMember('cible');
        const reason = interaction.options.getString('raison');

        if (!target) {
            const errEmbed = new EmbedBuilder().setColor(0xe74c3c).setDescription("❌ Utilisateur non trouvé.");
            return interaction.reply({ embeds: [errEmbed], ephemeral: true });
        }
        if (!target.kickable) {
            const errEmbed = new EmbedBuilder().setColor(0xe74c3c).setDescription("❌ Je ne peux pas expulser cet utilisateur.");
            return interaction.reply({ embeds: [errEmbed], ephemeral: true });
        }

        const dmEmbed = new EmbedBuilder()
            .setTitle('👟 Expulsion')
            .setDescription(`Vous avez été expulsé de **${interaction.guild.name}**.`)
            .addFields({ name: 'Raison', value: reason })
            .setColor(0xe74c3c);

        try { await target.send({ embeds: [dmEmbed] }); } catch (e) {}

        await target.kick(reason);

        const [result] = await pool.execute(
            'INSERT INTO sanctions (guild_id, user_id, moderator_id, type, reason) VALUES (?, ?, ?, ?, ?)',
            [interaction.guild.id, target.id, interaction.user.id, 'KICK', reason]
        );

        const successEmbed = new EmbedBuilder()
            .setTitle('👞 Utilisateur Expulsé')
            .setColor(0x2ecc71)
            .setDescription(`**${target.user.tag}** a été expulsé.`)
            .addFields(
                { name: 'Cas', value: `#${result.insertId}`, inline: true },
                { name: 'Raison', value: reason, inline: true }
            );

        await interaction.reply({ embeds: [successEmbed] });
    },
};
const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { pool } = require('../../db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription(' ⚠️  Avertir un membre du serveur.')
        .addUserOption(option => option.setName('cible').setDescription('Le membre à avertir').setRequired(true))
        .addStringOption(option => option.setName('raison').setDescription('La raison de l\'avertissement').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .setDMPermission(false),

    async execute(interaction) {
        const target = interaction.options.getUser('cible');
        const reason = interaction.options.getString('raison');

        if (target.bot) return interaction.reply({ content: "❌ Impossible d'avertir un bot.", ephemeral: true });

        const dmEmbed = new EmbedBuilder()
            .setTitle('⚠️ Avertissement Reçu')
            .setDescription(`Vous avez reçu un avertissement sur le serveur **${interaction.guild.name}**.`)
            .addFields({ name: 'Raison', value: reason })
            .setColor(0xf1c40f)
            .setTimestamp();

        try { await target.send({ embeds: [dmEmbed] }); } catch (e) { console.log("MP fermés pour " + target.tag); }

        const [result] = await pool.execute(
            'INSERT INTO sanctions (guild_id, user_id, moderator_id, type, reason) VALUES (?, ?, ?, ?, ?)',
            [interaction.guild.id, target.id, interaction.user.id, 'WARN', reason]
        );

        const replyEmbed = new EmbedBuilder()
            .setTitle('✅ Utilisateur averti')
            .setDescription(`**${target.tag}** a été averti (Cas #${result.insertId}).`)
            .addFields({ name: 'Raison', value: reason })
            .setColor(0xf1c40f);

        await interaction.reply({ embeds: [replyEmbed] });
    },
};
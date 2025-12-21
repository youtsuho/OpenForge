const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { pool } = require('../../db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription(' 🚫  Bannir un utilisateur du serveur.')
        .addUserOption(option => option.setName('target').setDescription('L\'utilisateur à bannir').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('La raison du bannissement').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .setDMPermission(false),
        
    async execute(interaction) {
        const targetUser = interaction.options.getUser('target');
        const reason = interaction.options.getString('reason');
        const member = interaction.guild.members.cache.get(targetUser.id);

        if (member && !member.bannable) {
            const noBanEmbed = new EmbedBuilder().setColor(0xe74c3c).setDescription("❌ Je ne peux pas bannir cet utilisateur.");
            return interaction.reply({ embeds: [noBanEmbed], ephemeral: true });
        }

        const dmEmbed = new EmbedBuilder()
            .setTitle('🚫 Bannissement Définitif')
            .setDescription(`Vous avez été banni du serveur **${interaction.guild.name}**.`)
            .addFields({ name: 'Raison', value: reason })
            .setColor(0x000000)
            .setTimestamp();

        try { await targetUser.send({ embeds: [dmEmbed] }); } catch (e) {}

        try {
            await interaction.guild.members.ban(targetUser.id, { reason: reason });
            
            const [result] = await pool.execute(
                'INSERT INTO sanctions (guild_id, user_id, moderator_id, type, reason) VALUES (?, ?, ?, ?, ?)',
                [interaction.guild.id, targetUser.id, interaction.user.id, 'BAN', reason]
            );

            const successEmbed = new EmbedBuilder()
                .setTitle('🚫 Utilisateur Banni')
                .setColor(0x2ecc71)
                .setDescription(`**${targetUser.tag}** a été banni définitivement.`)
                .addFields(
                    { name: 'Cas', value: `#${result.insertId}`, inline: true },
                    { name: 'Raison', value: reason, inline: true }
                );

            await interaction.reply({ embeds: [successEmbed] });
        } catch (error) {
            const errorEmbed = new EmbedBuilder().setColor(0xe74c3c).setDescription('❌ Une erreur est survenue lors du bannissement.');
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    },
};
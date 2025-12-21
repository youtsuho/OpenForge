const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ComponentType } = require('discord.js');
const { pool } = require('../../db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sanction-delete')
        .setDescription(' 👌  Retire une sanction spécifique à un membre.')
        .addUserOption(option => option.setName('cible').setDescription('Le membre concerné').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDMPermission(false),

    async execute(interaction) {
        const target = interaction.options.getUser('cible');
        const guildId = interaction.guild.id;

        const [rows] = await pool.execute('SELECT * FROM sanctions WHERE guild_id = ? AND user_id = ? ORDER BY timestamp DESC LIMIT 25', [guildId, target.id]);

        if (rows.length === 0) {
            const noSanctionsEmbed = new EmbedBuilder().setColor(0xe74c3c).setDescription(`❌ **${target.tag}** n'a aucune sanction enregistrée.`);
            return interaction.reply({ embeds: [noSanctionsEmbed], ephemeral: true });
        }

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('delete_sanction_menu')
            .setPlaceholder('Choisissez la sanction à supprimer...')
            .addOptions(rows.map(row => ({
                label: `Cas #${row.id} - ${row.type}`,
                description: row.reason.substring(0, 50),
                value: row.id.toString()
            })));

        const row = new ActionRowBuilder().addComponents(selectMenu);

        const promptEmbed = new EmbedBuilder()
            .setTitle('👌 Gestion des Sanctions')
            .setDescription(`Sélectionnez une sanction à supprimer définitivement pour **${target.tag}**.`)
            .setColor(0x3498db);

        const response = await interaction.reply({
            embeds: [promptEmbed],
            components: [row],
            ephemeral: true
        });

        const collector = response.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 60000 });

        collector.on('collect', async i => {
            const sanctionId = i.values[0];
            await pool.execute('DELETE FROM sanctions WHERE id = ?', [sanctionId]);

            const finalEmbed = new EmbedBuilder()
                .setColor(0x2ecc71)
                .setDescription(`✅ La sanction **#${sanctionId}** a été supprimée avec succès.`);

            await i.update({ embeds: [finalEmbed], components: [] });
            collector.stop();
        });
    },
};
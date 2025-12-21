const { Events, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits, ChannelType } = require('discord.js');
const { pool } = require('../../db');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        // --- GESTION DES COMMANDES SLASH ---
        if (interaction.isChatInputCommand()) {
            const command = interaction.client.commands.get(interaction.commandName);
            if (!command) return;

            try {
                await command.execute(interaction);
            } catch (error) {
                console.error(`Erreur commande ${interaction.commandName}:`, error);
                const errorEmbed = new EmbedBuilder()
                    .setColor(0xe74c3c)
                    .setTitle('❌ Erreur Système')
                    .setDescription('Une erreur interne est survenue lors de l\'exécution de cette commande.');
                
                const reply = { embeds: [errorEmbed], ephemeral: true };
                interaction.replied || interaction.deferred ? await interaction.followUp(reply) : await interaction.reply(reply);
            }
        }

        // --- GESTION DES BOUTONS (TICKETS) ---
        if (interaction.isButton()) {
            const { customId, guild, user, member } = interaction;

            if (customId === 'ticket_open') {
                await interaction.deferReply({ ephemeral: true });

                const [settings] = await pool.execute('SELECT * FROM ticket_settings WHERE guild_id = ?', [guild.id]);
                if (settings.length === 0) {
                    const noConfigEmbed = new EmbedBuilder().setColor(0xe74c3c).setDescription('❌ Le système de tickets n\'est pas configuré. Utilisez `/ticket-config`.');
                    return interaction.editReply({ embeds: [noConfigEmbed] });
                }

                const { category_id, staff_role_id } = settings[0];

                const [activeTickets] = await pool.execute('SELECT * FROM tickets WHERE user_id = ? AND guild_id = ? AND status = "open"', [user.id, guild.id]);
                if (activeTickets.length > 0) {
                    const alreadyOpenEmbed = new EmbedBuilder().setColor(0xe74c3c).setDescription(`❌ Vous avez déjà un ticket ouvert : <#${activeTickets[0].channel_id}>`);
                    return interaction.editReply({ embeds: [alreadyOpenEmbed] });
                }

                try {
                    const channel = await guild.channels.create({
                        name: `ticket-${user.username}`,
                        type: ChannelType.GuildText,
                        parent: category_id || null,
                        permissionOverwrites: [
                            { id: guild.roles.everyone, deny: [PermissionFlagsBits.ViewChannel] },
                            { id: user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.AttachFiles, PermissionFlagsBits.EmbedLinks] },
                            { id: staff_role_id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageMessages] }
                        ]
                    });

                    await pool.execute('INSERT INTO tickets (channel_id, guild_id, user_id) VALUES (?, ?, ?)', [channel.id, guild.id, user.id]);

                    const welcomeEmbed = new EmbedBuilder()
                        .setTitle('🎫 Nouveau Ticket')
                        .setDescription(`Bonjour ${user}, l'équipe de support a été prévenue.\nMerci de décrire votre demande en attendant une réponse.`)
                        .addFields({ name: 'Auteur', value: `${user.tag}`, inline: true })
                        .setColor(0x2ecc71)
                        .setTimestamp();

                    const row = new ActionRowBuilder().addComponents(
                        new ButtonBuilder().setCustomId('ticket_close').setLabel('Fermer').setEmoji('🔒').setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder().setCustomId('ticket_delete').setLabel('Supprimer').setEmoji('🗑️').setStyle(ButtonStyle.Danger)
                    );

                    await channel.send({ content: `<@&${staff_role_id}> | ${user}`, embeds: [welcomeEmbed], components: [row] });
                    const successEmbed = new EmbedBuilder().setColor(0x2ecc71).setDescription(`✅ Votre ticket a été créé : ${channel}`);
                    await interaction.editReply({ embeds: [successEmbed] });

                } catch (error) {
                    const errorPermsEmbed = new EmbedBuilder().setColor(0xe74c3c).setDescription('❌ Erreur lors de la création du salon. Vérifiez mes permissions.');
                    await interaction.editReply({ embeds: [errorPermsEmbed] });
                }
            }

            if (customId === 'ticket_close') {
                const [ticketData] = await pool.execute('SELECT * FROM tickets WHERE channel_id = ?', [interaction.channelId]);
                if (ticketData.length === 0) {
                    const errorTicketEmbed = new EmbedBuilder().setColor(0xe74c3c).setDescription('❌ Ce salon n\'est pas un ticket valide.');
                    return interaction.reply({ embeds: [errorTicketEmbed], ephemeral: true });
                }

                await interaction.deferUpdate();
                await interaction.channel.permissionOverwrites.edit(ticketData[0].user_id, { SendMessages: false });
                await pool.execute('UPDATE tickets SET status = "closed" WHERE channel_id = ?', [interaction.channelId]);

                const closeEmbed = new EmbedBuilder()
                    .setDescription(`🔒 Ticket fermé par ${user}. Les permissions d'écriture ont été retirées.`)
                    .setColor(0xe74c3c);
                await interaction.channel.send({ embeds: [closeEmbed] });
            }

            if (customId === 'ticket_delete') {
                if (!member.permissions.has(PermissionFlagsBits.ManageChannels)) {
                    const noPermsEmbed = new EmbedBuilder().setColor(0xe74c3c).setDescription('❌ Seul le staff peut supprimer un ticket.');
                    return interaction.reply({ embeds: [noPermsEmbed], ephemeral: true });
                }

                const deleteWaitEmbed = new EmbedBuilder().setColor(0xe67e22).setDescription('🗑️ Suppression du ticket dans 5 secondes...');
                await interaction.reply({ embeds: [deleteWaitEmbed] });
                
                setTimeout(async () => {
                    try {
                        await pool.execute('DELETE FROM tickets WHERE channel_id = ?', [interaction.channelId]);
                        await interaction.channel.delete();
                    } catch (e) {}
                }, 5000);
            }
        }
    },
};
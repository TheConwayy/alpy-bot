import { Events, Listener } from "@sapphire/framework";
import { ContainerBuilder, Interaction, TextDisplayBuilder } from "discord.js";
import { Emojis } from "../lib/emojis";

export class DeleteMessageListener extends Listener {
    public constructor(context: Listener.LoaderContext, options: Listener.Options) {
        super(context, {
            ...options,
            event: Events.InteractionCreate,
        });
    }

    public run(interaction: Interaction) {
        if (!interaction.isButton()) return

        if (interaction.customId === 'delete-response') {
            const message = interaction.channel?.messages.cache.get(interaction.message.id);

            const text = new TextDisplayBuilder().setContent(`## ${Emojis.invalid} This message was deleted by the user.`);

            const container = new ContainerBuilder()
                .addTextDisplayComponents(text)
            
            if (message) message.edit({
                components: [container]
            });
        }
    }
}
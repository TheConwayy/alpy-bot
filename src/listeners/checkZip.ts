import { Events, Listener } from '@sapphire/framework';
import { Interaction } from 'discord.js';

export class CheckZipListener extends Listener {
	public constructor(context: Listener.LoaderContext, options: Listener.Options) {
		super(context, {
			...options,
			event: Events.InteractionCreate
		});
	}

	public run(interaction: Interaction) {
		if (!interaction.isButton()) return;

		if (interaction.customId.startsWith('checkZip-')) {
			const zip = interaction.customId.split('-')[1];
			interaction.reply({ content: `Zip: ${zip}`, ephemeral: true });
		}
	}
}

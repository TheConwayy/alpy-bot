import { Args, Command } from '@sapphire/framework';
import { Message } from 'discord.js';
import { createSetting } from '../../lib/settings';
import { MessageContainer } from '../../utils/messageContainer';
import { Emojis } from '../../utils/emojis';

export class CreateSettingCommand extends Command {
	public constructor(context: Command.LoaderContext, options: Command.Options) {
		super(context, {
			...options,
			name: 'create-setting',
			description: 'Create a new setting',
			requiredUserPermissions: ['Administrator']
		});
	}

	public override async messageRun(message: Message, args: Args) {
		const setting = await args.pick('string');
		const value = await args.pick('string');

		if (!setting || !value) {
			const errorContainer = new MessageContainer().setHeading('Error', Emojis.invalid).setBody('Please provide both a setting and a value.');

			return message.reply(errorContainer.build());
		}

		const result = await createSetting(setting, value);
		const success = result.success;

		const messageContainer = new MessageContainer()
			.setHeading(success ? 'Success' : 'Error', success ? Emojis.valid : Emojis.invalid)
			.setBody(
				success
					? `Successfully created setting \`${setting}\` with value \`${value}\``
					: `Failed to create setting \`${setting}\`.\n**\`Error:\`** ${result.error}`
			);

		return message.reply(messageContainer.build());
	}
}

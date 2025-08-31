import { Command } from '@sapphire/framework';
import { Message } from 'discord.js';
import { viewSettings } from '../../lib/settings';
import { MessageContainer } from '../../utils/messageContainer';
import { Emojis } from '../../utils/emojis';
import { noIndent } from '../../utils/noIndent';

export class ViewSettingCommand extends Command {
	public constructor(context: Command.LoaderContext, options: Command.Options) {
		super(context, {
			...options,
			name: 'view-settings',
			description: 'View a setting',
			requiredUserPermissions: ['Administrator']
		});
	}

	public override async messageRun(message: Message) {
		const data = await viewSettings();
		const success = data.success;
		const settings = data.settings;
		const error = data.error;

		const messageContainer = new MessageContainer()
			.setHeading(success ? 'Success' : 'Error', success ? Emojis.valid : Emojis.invalid)
			.setBody(
				success
					? `## Retrieved settings:\n${settings.map((setting) => noIndent`) **\`${setting.setting}:\`** \`${setting.value}\``).join('\n')}`
					: `Failed to retrieve settings.\n**\`Error:\`** ${error}`
			);

		return message.reply(messageContainer.build());
	}
}

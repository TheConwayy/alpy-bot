import { Args, Command } from '@sapphire/framework';
import { Message } from 'discord.js';
import { Emojis } from '../../utils/emojis';
import { MessageContainer } from '../../utils/messageContainer';
import { deleteSetting } from '../../lib/settings';

export class DeleteSettingCommand extends Command {
  public constructor(context: Command.LoaderContext, options: Command.Options) {
    super(context, {
      ...options,
      name: 'delete-setting',
      description: 'Delete a setting',
      requiredUserPermissions: ['Administrator'],
    });
  }

  public override async messageRun(message: Message, args: Args) {
    const setting = await args.pick('string');

    if (!setting) {
      const errorContainer = new MessageContainer()
        .setHeading('Error', Emojis.invalid)
        .setBody('Please provide a setting to delete.');

      return message.reply(errorContainer.build());
    }

    const result = await deleteSetting(setting);
    const success = result.success;

    const messageContainer = new MessageContainer()
      .setHeading(
        success ? 'Success' : 'Error',
        success ? Emojis.valid : Emojis.invalid
      )
      .setBody(
        success
          ? `Successfully deleted setting \`${setting}\``
          : `Failed to delete setting \`${setting}\`.\n**\`Error:\`** ${result.error}`
      );

    return message.reply(messageContainer.build());
  }
}

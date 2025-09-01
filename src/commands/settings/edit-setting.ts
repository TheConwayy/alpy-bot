import { Args, Command } from '@sapphire/framework';
import { Message } from 'discord.js';
import { editSetting } from '../../lib/settings';
import { Emojis } from '../../utils/emojis';
import { MessageContainer } from '../../utils/messageContainer';

export class EditSettingCommand extends Command {
  public constructor(context: Command.LoaderContext) {
    super(context, {
      name: 'edit-setting',
      description: 'Edit a setting',
      requiredUserPermissions: ['Administrator'],
    });
  }

  public override async messageRun(message: Message, args: Args) {
    const setting = await args.pick('string');
    const value = await args.pick('string');

    if (!setting || !value) {
      const errorContainer = new MessageContainer()
        .setHeading('Error', Emojis.invalid)
        .setBody('Please provide both a setting and a value.');

      return message.reply(errorContainer.build());
    }

    const result = await editSetting(setting, value);
    const success = result.success;

    const messageContainer = new MessageContainer()
      .setHeading(
        success ? 'Success' : 'Error',
        success ? Emojis.valid : Emojis.invalid
      )
      .setBody(
        success
          ? `Successfully edited setting \`${setting}\` with value \`${value}\``
          : `Failed to edit setting \`${setting}\`.\n**\`Error:\`** ${result.error}`
      );

    return message.reply(messageContainer.build());
  }
}

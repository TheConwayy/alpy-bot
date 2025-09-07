import { Args, Command } from '@sapphire/framework';
import { Message } from 'discord.js';
import { Emojis } from '../../../utils/emojis';
import { MessageContainer } from '../../../utils/messageContainer';
import { UniversalSettingsHandlers } from './subcommands';
import { sendTyping } from '../../../utils/sendTyping';

enum Action {
  Add = 'add',
  Remove = 'remove',
  Edit = 'edit',
  GetAll = 'get-all',
}

export class UniversalSettingCommand extends Command {
  public constructor(context: Command.LoaderContext, options: Command.Options) {
    super(context, {
      ...options,
      name: 'universal-setting',
      description: 'Set a universal setting',
      requiredUserPermissions: ['Administrator'],
      aliases: ['us'],
    });
  }

  public override async messageRun(message: Message, args: Args) {
    if (message.author.id !== process.env.OWNER_ID) {
      return;
    }

    await sendTyping(message);

    const action = await args.pick('string').catch(() => null);
    const setting = await args.pick('string').catch(() => null);
    const value = await args.rest('string').catch(() => null);

    if (!action || (!setting && action !== Action.GetAll)) {
      const errorContainer = new MessageContainer()
        .setHeading('Error', Emojis.invalid)
        .setBody('Please provide an action and a setting.');

      return message.reply(errorContainer.build());
    }

    if (
      (action === Action.Add && !value) ||
      (action === Action.Edit && !value)
    ) {
      const errorContainer = new MessageContainer()
        .setHeading('Error', Emojis.invalid)
        .setBody('Please provide a value.');

      return message.reply(errorContainer.build());
    }

    const errorContainer = new MessageContainer()
      .setHeading('Error', Emojis.invalid)
      .setBody('Invalid action.');

    switch (action) {
      case Action.Add:
        return UniversalSettingsHandlers.handleAdd(message, setting!, value!);
      case Action.Remove:
        return UniversalSettingsHandlers.handleRemove(message, setting!);
      case Action.Edit:
        return UniversalSettingsHandlers.handleEdit(message, setting!, value!);
      case Action.GetAll:
        return UniversalSettingsHandlers.handleGetAll(message);
      default:
        return message.reply(errorContainer.build());
    }
  }
}

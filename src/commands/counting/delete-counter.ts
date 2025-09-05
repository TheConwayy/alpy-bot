import { Args, Command } from '@sapphire/framework';
import { Message } from 'discord.js';
import { Emojis } from '../../utils/emojis';
import { MessageContainer } from '../../utils/messageContainer';
import { deleteCounter } from '../../lib/counters';
import { sendTyping } from '../../utils/sendTyping';

export class DeleteCounterCommand extends Command {
  public constructor(context: Command.LoaderContext, options: Command.Options) {
    super(context, {
      ...options,
      name: 'delete-counter',
      description: 'Delete a counter',
      requiredUserPermissions: ['Administrator'],
    });
  }

  public override async messageRun(message: Message, args: Args) {
    await sendTyping(message);

    const counter = await args.pick('string').catch(() => null);

    if (!counter) {
      const errorContainer = new MessageContainer()
        .setHeading('Error', Emojis.invalid)
        .setBody('Please provide a counter to delete.');

      return message.reply(errorContainer.build());
    }

    const result = await deleteCounter(counter);
    const success = result.success;

    const messageContainer = new MessageContainer()
      .setHeading(
        success ? 'Success' : 'Error',
        success ? Emojis.valid : Emojis.invalid
      )
      .setBody(
        success
          ? `Successfully deleted counter \`${counter}\`\nDon't forget to reset the counters!`
          : `Failed to delete counter \`${counter}\`.\n**\`Error:\`** ${result.error}`
      );

    return message.reply(messageContainer.build());
  }
}

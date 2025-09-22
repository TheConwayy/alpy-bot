import type {
  ChatInputCommandDeniedPayload,
  Events,
} from '@sapphire/framework';
import { Listener, UserError } from '@sapphire/framework';
import { Emojis } from '../../../utils/emojis';
import { MessageContainer } from '../../../utils/messageContainer';

export class UserEvent extends Listener<typeof Events.ChatInputCommandDenied> {
  public override async run(
    { context, message: content }: UserError,
    { interaction }: ChatInputCommandDeniedPayload
  ) {
    // `context: { silent: true }` should make UserError silent:
    // Use cases for this are for example permissions error when running the `eval` command.
    if (Reflect.get(Object(context), 'silent')) return;

    const container = new MessageContainer()
      .setHeading('Error', Emojis.invalid)
      .setBody(`## Error Details:\n${content}`);

    if (interaction.deferred || interaction.replied) {
      return interaction.editReply(container.build('edit'));
    }

    return interaction.reply(container.build('reply'));
  }
}

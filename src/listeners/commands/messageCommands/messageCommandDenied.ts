import type { Events, MessageCommandDeniedPayload } from '@sapphire/framework';
import { Listener, type UserError } from '@sapphire/framework';
import { MessageContainer } from '../../../utils/messageContainer';
import { Emojis } from '../../../utils/emojis';

export class UserEvent extends Listener<typeof Events.MessageCommandDenied> {
  public override async run(
    { context, message: content }: UserError,
    { message }: MessageCommandDeniedPayload
  ) {
    // `context: { silent: true }` should make UserError silent:
    // Use cases for this are for example permissions error when running the `eval` command.
    if (Reflect.get(Object(context), 'silent')) return;

    const container = new MessageContainer()
      .setHeading('Error', Emojis.invalid)
      .setBody(`## Error Details:\n${content}`);

    return message.reply(container.build('message'));
  }
}

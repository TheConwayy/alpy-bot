import { Message } from 'discord.js';
import { deleteUniversalSetting } from '../../../../lib/universalSettings';
import { Emojis } from '../../../../utils/emojis';
import { MessageContainer } from '../../../../utils/messageContainer';

export async function handleRemove(message: Message, setting: string) {
  const data = await deleteUniversalSetting(setting);
  if (!data.success) {
    const errorContainer = new MessageContainer()
      .setHeading('Error', Emojis.invalid)
      .setBody(`Failed to remove setting.\n**\`Error:\`** ${data.error}`);

    return message.reply(errorContainer.build());
  }

  const messageContainer = new MessageContainer()
    .setHeading('Success', Emojis.valid)
    .setBody(`Successfully removed setting \`${setting}\``);

  return message.reply(messageContainer.build());
}

import { Message } from 'discord.js';
import { deleteUniversalSetting } from '../../../../lib/universalSettings';
import { Emojis } from '../../../../utils/emojis';
import { MessageContainer } from '../../../../utils/messageContainer';
import { errorContainer } from '../../../../utils/errorContainer';

export async function handleRemove(message: Message, setting: string) {
  const data = await deleteUniversalSetting(setting);
  if (!data.success) {
    return errorContainer(
      message,
      `Failed to remove setting.\n**\`Error:\`** ${data.error}`
    );
  }

  const messageContainer = new MessageContainer()
    .setHeading('Success', Emojis.valid)
    .setBody(`Successfully removed setting \`${setting}\``);

  return message.reply(messageContainer.build('message'));
}

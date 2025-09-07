import { Message } from 'discord.js';
import { addUniveralSetting } from '../../../../lib/universalSettings';
import { Emojis } from '../../../../utils/emojis';
import { MessageContainer } from '../../../../utils/messageContainer';
import { errorContainer } from '../../../../utils/errorContainer';

export async function handleAdd(
  message: Message,
  setting: string,
  value: string
) {
  const data = await addUniveralSetting(setting, value);
  if (!data.success) {
    return errorContainer(
      message,
      `Failed to add setting.\n**\`Error:\`** ${data.error}`
    );
  }

  const messageContainer = new MessageContainer()
    .setHeading('Success', Emojis.valid)
    .setBody(
      `Successfully added setting \`${setting}\` with value \`${value}\``
    );

  return message.reply(messageContainer.build());
}

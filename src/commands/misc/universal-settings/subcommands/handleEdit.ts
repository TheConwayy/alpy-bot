import { Message } from 'discord.js';
import { editUniversalSetting } from '../../../../lib/universalSettings';
import { Emojis } from '../../../../utils/emojis';
import { MessageContainer } from '../../../../utils/messageContainer';
import { errorContainer } from '../../../../utils/errorContainer';

export async function handleEdit(
  message: Message,
  setting: string,
  value: string
) {
  const data = await editUniversalSetting(setting, value);
  if (!data.success) {
    return errorContainer(
      message,
      `Failed to edit setting.\n**\`Error:\`** ${data.error}`
    );
  }

  const messageContainer = new MessageContainer()
    .setHeading('Success', Emojis.valid)
    .setBody(
      `Successfully edited setting \`${setting}\` with value \`${value}\``
    );

  return message.reply(messageContainer.build());
}

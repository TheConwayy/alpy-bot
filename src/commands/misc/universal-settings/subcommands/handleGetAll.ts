import { Message } from 'discord.js';
import { getAllUniversalSettings } from '../../../../lib/universalSettings';
import { Emojis } from '../../../../utils/emojis';
import { MessageContainer } from '../../../../utils/messageContainer';
import { noIndent } from '../../../../utils/noIndent';
import { errorContainer } from '../../../../utils/errorContainer';

export async function handleGetAll(message: Message) {
  const data = await getAllUniversalSettings();

  if (!data.success) {
    return errorContainer(
      message,
      `Failed to get all settings.\n**\`Error:\`** ${data.error}`
    );
  }

  const messageContainer = new MessageContainer()
    .setHeading('Settings', Emojis.notepad)
    .setBody(
      data.setting
        .map(
          (setting) =>
            noIndent`**\`${setting.setting}:\`** \`${setting.value}\``
        )
        .join('\n')
    );

  return message.reply(messageContainer.build('message'));
}

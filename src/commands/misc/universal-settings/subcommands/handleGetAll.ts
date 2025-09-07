import { Message } from 'discord.js';
import {
  getAlluniversalSettings,
  UniveralSetting,
} from '../../../../lib/universalSettings';
import { Emojis } from '../../../../utils/emojis';
import { MessageContainer } from '../../../../utils/messageContainer';
import { noIndent } from '../../../../utils/noIndent';

export async function handleGetAll(message: Message) {
  const data = await getAlluniversalSettings();

  if (!data.success) {
    const errorContainer = new MessageContainer()
      .setHeading('Error', Emojis.invalid)
      .setBody(`Failed to get all settings.\n**\`Error:\`** ${data.error}`);

    return message.reply(errorContainer.build());
  }

  const messageContainer = new MessageContainer()
    .setHeading('Settings', Emojis.notepad)
    .setBody(
      (data.setting as UniveralSetting[])
        .map(
          (setting) =>
            noIndent`**\`${setting.setting}:\`** \`${setting.value}\``
        )
        .join('\n')
    );

  return message.reply(messageContainer.build());
}

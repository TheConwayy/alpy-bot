import { Message } from 'discord.js';
import { Emojis } from './emojis';
import { MessageContainer } from './messageContainer';

/**
 * Sends an error message to the user with the given error.
 * @param message The message where the error happened.
 * @param error The error message to send.
 * @returns The sent message.
 */
export function errorContainer(message: Message, error: string) {
  const errorContainer = new MessageContainer()
    .setHeading('Error', Emojis.invalid)
    .setBody(`**\`Error:\`** ${error}`);

  return message.reply(errorContainer.build());
}

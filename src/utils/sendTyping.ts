import { ChannelType, Message } from 'discord.js';

export async function sendTyping(message: Message): Promise<void> {
  if (
    message.channel.type !== ChannelType.DM &&
    message.channel.type !== ChannelType.GroupDM
  ) {
    await message.channel.sendTyping();
  }
}

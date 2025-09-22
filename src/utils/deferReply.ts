import {
  ChannelType,
  CommandInteraction,
  InteractionResponse,
  Message,
  MessageFlags,
} from 'discord.js';

export async function deferReply(
  interactionOrMessage: CommandInteraction | Message
): Promise<InteractionResponse | void> {
  if (interactionOrMessage instanceof CommandInteraction) {
    if (!interactionOrMessage.replied || !interactionOrMessage.deferred) {
      return interactionOrMessage.deferReply({ flags: MessageFlags.Ephemeral });
    }
  } else {
    if (
      interactionOrMessage.channel.type !== ChannelType.DM &&
      interactionOrMessage.channel.type !== ChannelType.GroupDM
    ) {
      return await interactionOrMessage.channel.sendTyping();
    }
  }
}

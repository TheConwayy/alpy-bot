import { Command } from '@sapphire/framework';
import { ChannelType, Message } from 'discord.js';
import { getAllCounters, resetAllCounters } from '../../lib/counters';
import { MessageContainer } from '../../utils/messageContainer';
import { Emojis } from '../../utils/emojis';
import {
  addCounterButtons,
  buildCounterFunction,
  formatString,
} from './init-counters';
import { getSetting } from '../../lib/settings';
import { sendTyping } from '../../utils/sendTyping';
import { errorContainer } from '../../utils/errorContainer';

export class ResetCountersCommand extends Command {
  public constructor(context: Command.LoaderContext) {
    super(context, {
      name: 'reset-counters',
      description: 'Reset all counters',
      aliases: ['checkout'],
    });
  }

  public override async messageRun(message: Message) {
    await sendTyping(message);

    const result = await resetAllCounters();

    if (!result.success) {
      return errorContainer(
        message,
        `Failed to reset counters.\n**\`Error:\`** ${result.error}`
      );
    }

    const counters = await getAllCounters();

    if (!counters.success || !counters.counter) {
      return errorContainer(message, 'Error getting counters');
    }

    const counterContainer = new MessageContainer()
      .setHeading('Counters', Emojis.notepad)
      .setBody(buildCounterFunction({ counter: counters.counter }));

    addCounterButtons(counters.counter, counterContainer);

    const countingChannel = await getSetting('counting_channel');
    if (!countingChannel) {
      return errorContainer(message, 'Please set a counting channel first');
    }

    const channel = message.guild?.channels.cache.get(countingChannel.value);
    if (!channel) {
      return errorContainer(message, 'Counting channel could not be found');
    }

    if (channel.type !== ChannelType.GuildText) {
      return errorContainer(message, 'Counting channel is not a text channel');
    }

    const messagesInChannel = await channel.messages.fetch();

    for (const message of messagesInChannel.values()) {
      await message.delete();
    }

    await channel.send(counterContainer.build());

    const successContainer = new MessageContainer()
      .setHeading('Success', Emojis.valid)
      .setBody(
        `Successfully reset all counters\n## Your stats:\n${counters.counter.map((counter) => `**${formatString(counter.counter_name, false)}**: ${counter.count_value}`).join('\n')}`
      );

    return await message.reply(successContainer.build());
  }
}

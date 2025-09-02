import { Command } from '@sapphire/framework';
import { ChannelType, Message } from 'discord.js';
import { getAllCounters, resetAllCounters } from '../../lib/counters';
import { MessageContainer } from '../../utils/messageContainer';
import { Emojis } from '../../utils/emojis';
import { addCounterButtons, buildCounterFunction } from './init-counters';
import { getSetting } from '../../lib/settings';

export class ResetCountersCommand extends Command {
  public constructor(context: Command.LoaderContext) {
    super(context, {
      name: 'reset-counters',
      description: 'Reset all counters',
      aliases: ['checkout'],
    });
  }

  public override async messageRun(message: Message) {
    const counters = await getAllCounters();
    const result = await resetAllCounters();

    if (!counters.success || !counters.counter) {
      const errorContainer = new MessageContainer()
        .setHeading('Error', Emojis.invalid)
        .setBody('Error getting counters');

      return message.reply(errorContainer.build());
    }

    const counterContainer = new MessageContainer()
      .setHeading('Counters', Emojis.notepad)
      .setBody(buildCounterFunction({ counter: counters.counter }));

    addCounterButtons(counters.counter, counterContainer);

    const countingChannel = await getSetting('counting_channel');
    if (!countingChannel) {
      const errorContainer = new MessageContainer()
        .setHeading('Error', Emojis.invalid)
        .setBody(
          'Please set a counting channel first.\n`!create-setting counting_channel <channel>`'
        );

      return message.reply(errorContainer.build());
    }

    const channel = message.guild?.channels.cache.get(countingChannel.value);
    if (!channel) {
      const errorContainer = new MessageContainer()
        .setHeading('Error', Emojis.invalid)
        .setBody('Counting channel could not be found');

      return message.reply(errorContainer.build());
    }

    if (channel.type !== ChannelType.GuildText) {
      const errorContainer = new MessageContainer()
        .setHeading('Error', Emojis.invalid)
        .setBody('Counting channel is not a text channel');

      return message.reply(errorContainer.build());
    }

    const messagesInChannel = await channel.messages.fetch();

    for (const message of messagesInChannel.values()) {
      await message.delete();
    }

    await channel.send(counterContainer.build());

    const statusContainer = new MessageContainer()
      .setHeading(
        result.success ? 'Success' : 'Error',
        result.success ? Emojis.valid : Emojis.invalid
      )
      .setBody(
        result.success
          ? 'Successfully reset all counters'
          : `Failed to reset all counters.\n**\`Error:\`** ${result.error}`
      );

    return await message.reply(statusContainer.build());
  }
}

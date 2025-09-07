import { Command } from '@sapphire/framework';
import { ButtonStyle, ChannelType, Message } from 'discord.js';
import { getSetting } from '../../lib/settings';
import { Emojis } from '../../utils/emojis';
import { MessageContainer } from '../../utils/messageContainer';
import { getAllCounters } from '../../lib/counters';
import { noIndent } from '../../utils/noIndent';
import { sendTyping } from '../../utils/sendTyping';
import { errorContainer } from '../../utils/errorContainer';

/**
 * Formats a given string to a space-separated string with title case.
 * If notPlural is true, it will remove the last character if the string ends with 's'.
 * @param string The string to format.
 * @param notPlural If true, it will remove the last character if the string ends with 's'.
 * @returns The formatted string.
 */
export function formatString(string: string, notPlural: boolean) {
  let str = string
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');

  if (notPlural) {
    if (str.endsWith('s')) {
      str = str.slice(0, -1);
    }
  }

  return str;
}

/**
 * Builds a string containing a counter list from a given list of counters.
 * @param counters The list of counters to build the string from.
 * @returns The string containing the counter list.
 */
export function buildCounterFunction(counters: {
  counter: {
    counter_name: string;
    count_value: number;
    counter_description?: string;
  }[];
}) {
  return counters.counter
    .map((counter) => {
      return noIndent`) **${formatString(counter.counter_name, false)}**: \`${counter.count_value.toString()}\`${counter.counter_description ? `\n${counter.counter_description}` : ''}${counter.counter_description ? ' | ' : '\n'}\`${counter.counter_name}\``;
    })
    .join('\n');
}

export function addCounterButtons(
  counters: { counter_name: string }[],
  container: MessageContainer
) {
  for (const counter of counters) {
    container.addButton({
      label: `+1 ${formatString(counter.counter_name, true)}`,
      style: ButtonStyle.Primary,
      customId: `counter-${counter.counter_name}`,
    });
  }
}

export class InitCountersCommand extends Command {
  public constructor(context: Command.LoaderContext) {
    super(context, {
      name: 'init-counters',
      description: 'Initialize all counters',
      requiredUserPermissions: ['Administrator'],
    });
  }

  public override async messageRun(message: Message) {
    await sendTyping(message);

    const channelResult = await getSetting('counting_channel');
    if (!channelResult) {
      return errorContainer(message, 'Counting channel is not set');
    }

    const channel = message.guild?.channels.cache.get(channelResult.value);
    if (!channel) {
      return errorContainer(message, 'Counting channel is not found');
    }

    if (channel.type !== ChannelType.GuildText) {
      return errorContainer(message, 'Counting channel is not a text channel');
    }

    const messagesInChannel = await channel.messages.fetch();

    for (const message of messagesInChannel.values()) {
      await message.delete();
    }

    const counters = await getAllCounters();

    if (!counters.success || !counters.counter) {
      return errorContainer(
        message,
        'Failed to initialize counters\n**Error:** ' + counters.error
      );
    }

    const counterContainer = new MessageContainer()
      .setHeading('Counters', Emojis.notepad)
      .setBody(buildCounterFunction({ counter: counters.counter }));

    addCounterButtons(counters.counter, counterContainer);

    await channel.send(counterContainer.build());

    return message.reply('Counters have been initialized!');
  }
}

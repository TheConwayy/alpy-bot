import { Command } from '@sapphire/framework';
import { ButtonStyle, ChannelType, Message } from 'discord.js';
import { getSetting } from '../../lib/settings';
import { Emojis } from '../../utils/emojis';
import { MessageContainer } from '../../utils/messageContainer';
import { getAllCounters } from '../../lib/counters';
import { noIndent } from '../../utils/noIndent';

/**
 * Formats a given string to a space-separated string with title case.
 * If notPlural is true, it will remove the last character if the string ends with 's'.
 * @param string The string to format.
 * @param notPlural If true, it will remove the last character if the string ends with 's'.
 * @returns The formatted string.
 */
function formatString(string: string, notPlural: boolean) {
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
    const channelResult = await getSetting('counting_channel');
    if (!channelResult) {
      const errorContainer = new MessageContainer()
        .setHeading('Error', Emojis.invalid)
        .setBody(
          'Please set a counting channel first.\n`!create-setting counting_channel <channel>`'
        );

      return message.reply(errorContainer.build());
    }

    const channel = message.guild?.channels.cache.get(channelResult.value);
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

    const counters = await getAllCounters();

    if (!counters.success || !counters.counter) {
      const errorContainer = new MessageContainer()
        .setHeading('Error', Emojis.invalid)
        .setBody(
          `Failed to initialize counters.\n**\`Error:\`** ${counters.error}`
        );

      return message.reply(errorContainer.build());
    }

    const counterContainer = new MessageContainer()
      .setHeading('Counters', Emojis.notepad)
      .setBody(buildCounterFunction({ counter: counters.counter }));

    addCounterButtons(counters.counter, counterContainer);

    await channel.send(counterContainer.build());

    return message.reply('Counters have been initialized!');
  }
}

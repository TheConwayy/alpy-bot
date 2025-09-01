import { Events, Listener } from '@sapphire/framework';
import { Interaction, MessageEditOptions, MessageFlags } from 'discord.js';
import { getAllCounters, incrementCounter } from '../lib/counters';
import { MessageContainer } from '../utils/messageContainer';
import { Emojis } from '../utils/emojis';
import {
  addCounterButtons,
  buildCounterFunction,
} from '../commands/counting/init-counters';

export class CountersListener extends Listener {
  public constructor(
    context: Listener.LoaderContext,
    options: Listener.Options
  ) {
    super(context, {
      ...options,
      event: Events.InteractionCreate,
    });
  }

  public async run(interaction: Interaction) {
    if (!interaction.isButton()) return;

    if (interaction.customId.startsWith('counter-')) {
      const counterName = interaction.customId.split('-')[1];

      const counter = await incrementCounter(counterName);
      if (!counter.success || !counter.counter) {
        return interaction.reply({
          content: 'Error incrementing counter',
          flags: MessageFlags.Ephemeral,
        });
      }

      const allCounters = await getAllCounters();
      if (!allCounters.success || !allCounters.counter) {
        return interaction.reply({
          content: 'Error getting counters',
          flags: MessageFlags.Ephemeral,
        });
      }

      const container = new MessageContainer()
        .setHeading('Counters', Emojis.notepad)
        .setBody(buildCounterFunction({ counter: allCounters.counter }));

      addCounterButtons(allCounters.counter, container);

      await interaction.message.edit(container.build() as MessageEditOptions);

      return interaction.reply({
        content: 'Counter incremented',
        flags: MessageFlags.Ephemeral,
      });
    } else return;
  }
}

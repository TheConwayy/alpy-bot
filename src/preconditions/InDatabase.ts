import { AllFlowsPrecondition } from '@sapphire/framework';
import type {
  Message,
  ChatInputCommandInteraction,
  ContextMenuCommandInteraction,
} from 'discord.js';
import { supabase } from '../lib/supabaseClient';

export class InDatabasePrecondition extends AllFlowsPrecondition {
  public constructor(
    context: AllFlowsPrecondition.LoaderContext,
    options: AllFlowsPrecondition.Options
  ) {
    super(context, {
      ...options,
      name: 'InDatabase',
      position: 20,
    });
  }
  private async checkGuild(guildId: string) {
    const { data, error } = await supabase
      .from('guilds')
      .select('id, active')
      .eq('id', guildId)
      .single();

    if (error || !data) {
      return this.error({
        identifier: 'guildNotFound',
        message: 'This guild does not exist',
        context: { fancy: true, title: 'Guild not found' },
      });
    }

    if (data.active !== true) {
      return this.error({
        identifier: 'guildNotActive',
        message: 'This guild exists but is not active',
        context: {
          fancy: true,
          title: 'Guild not active',
        },
      });
    }

    return this.ok();
  }

  public override messageRun(message: Message) {
    if (!message.guild) return this.ok();
    return this.checkGuild(message.guild.id);
  }

  public override chatInputRun(interaction: ChatInputCommandInteraction) {
    if (!interaction.guild) return this.ok();
    if (interaction.commandName === 'server') return this.ok();
    return this.checkGuild(interaction.guild.id);
  }

  public override contextMenuRun(interaction: ContextMenuCommandInteraction) {
    if (!interaction.guild) return this.ok();
    return this.checkGuild(interaction.guild.id);
  }
}

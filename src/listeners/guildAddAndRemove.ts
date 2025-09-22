import { Events, Listener } from '@sapphire/framework';
import { Guild } from 'discord.js';
import { supabase } from '../lib/supabaseClient';

export class GuildAddListener extends Listener {
  public constructor(
    context: Listener.LoaderContext,
    options: Listener.Options
  ) {
    super(context, {
      ...options,
      event: Events.GuildCreate,
      once: true,
    });
  }

  public async run(guild: Guild) {
    const { error } = await supabase.from('guilds').upsert({
      id: guild.id,
      guild_owner: guild.ownerId,
    });

    if (error) console.error(error);
    console.log(`Joined guild: ${guild.name} (${guild.id})`);
  }
}

export class GuildRemoveListener extends Listener {
  public constructor(
    context: Listener.LoaderContext,
    options: Listener.Options
  ) {
    super(context, {
      ...options,
      event: Events.GuildDelete,
    });
  }

  public async run(guild: Guild) {
    const { error } = await supabase.from('guilds').delete().eq('id', guild.id);

    if (error) console.error(error);
    console.log(`Left guild: ${guild.name} (${guild.id})`);
  }
}

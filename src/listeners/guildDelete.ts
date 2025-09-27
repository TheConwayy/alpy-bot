import { Listener } from '@sapphire/framework';
import { Events, Guild } from 'discord.js';
import { supabase } from '../lib/supabaseClient';

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
    const { error: botAdminDeleteError, count } = await supabase
      .from('users')
      .delete({ count: 'exact' })
      .eq('guild_id', guild.id)
      .eq('is_admin', true);

    const { error: guildDeleteError } = await supabase
      .from('guilds')
      .delete()
      .eq('id', guild.id);

    if (guildDeleteError || botAdminDeleteError)
      console.error(guildDeleteError, botAdminDeleteError);

    console.log(
      `Left guild: ${guild.name} (${guild.id}) - ${count} ${count === 1 ? 'admin' : 'admins'} removed`
    );
  }
}

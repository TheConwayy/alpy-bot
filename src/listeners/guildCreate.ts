import { Listener } from '@sapphire/framework';
import { Guild, Events } from 'discord.js';
import { supabase } from '../lib/supabaseClient';
import { randomBytes } from 'crypto';

function generatePassword(length: number) {
  const charset =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  const bytes = randomBytes(length);
  let password = '';

  for (let i = 0; i < length; i++) {
    const index = bytes[i] % charset.length;
    password += charset[index];
  }

  return password;
}

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
    const password = generatePassword(16);

    const { error: guildUpsertError } = await supabase.from('guilds').upsert({
      id: guild.id,
      guild_owner: guild.ownerId,
      activation_password: password,
    });

    const { error: botAdminUpsertError } = await supabase
      .from('bot_admins')
      .upsert({
        guild_id: guild.id,
        user_id: guild.ownerId,
      });

    if (guildUpsertError || botAdminUpsertError)
      console.error(guildUpsertError, botAdminUpsertError);

    console.log(
      `Joined guild: ${guild.name} (${guild.id}) - ${guild.ownerId} added as admin`
    );
  }
}

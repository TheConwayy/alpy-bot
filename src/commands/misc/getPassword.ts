import { Args, Command } from '@sapphire/framework';
import { Message } from 'discord.js';
import { supabase } from '../../lib/supabaseClient';
import { deferReply } from '../../utils/deferReply';
import { MessageContainer } from '../../utils/messageContainer';

export class GetPasswordCommand extends Command {
  public constructor(context: Command.LoaderContext, options: Command.Options) {
    super(context, {
      ...options,
      name: 'get-password',
      description: 'Get a password to activate a guild',
      requiredUserPermissions: ['Administrator'],
    });
  }

  public override async messageRun(message: Message, args: Args) {
    if (message.author.id !== process.env.OWNER_ID) {
      return;
    }

    await deferReply(message);

    const guildId = await args.pick('string').catch(() => null);

    if (!guildId) {
      return;
    }

    const { data, error } = await supabase
      .from('guilds')
      .select('activation_password')
      .eq('id', guildId)
      .single();

    if (error || !data) {
      return message.reply('Guild not found');
    }

    const container = new MessageContainer()
      .setHeading('Password', '🔑')
      .setBody(`Password: ||\`${data.activation_password}\`||`);

    return message.reply(container.build('message'));
  }
}

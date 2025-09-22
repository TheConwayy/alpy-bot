import { Subcommand } from '@sapphire/plugin-subcommands';
import { deferReply } from '../../utils/deferReply';
import { errorContainer } from '../../utils/errorContainer';
import { supabase } from '../../lib/supabaseClient';
import { Emojis } from '../../utils/emojis';
import { MessageContainer } from '../../utils/messageContainer';

export class ServerCommand extends Subcommand {
  public constructor(
    context: Subcommand.LoaderContext,
    options: Subcommand.Options
  ) {
    super(context, {
      ...options,
      name: 'server',
      subcommands: [
        {
          name: 'activate',
          chatInputRun: 'serverActivate',
          requiredUserPermissions: ['Administrator'],
        },
      ],
    });
  }

  public override registerApplicationCommands(registry: Subcommand.Registry) {
    registry.registerChatInputCommand((builder) =>
      builder
        .setName('server')
        .setDescription('server command')
        .addSubcommand((subcommand) =>
          subcommand
            .setName('activate')
            .setDescription('Activate a guild')
            .addStringOption((option) =>
              option
                .setName('password')
                .setDescription('The password to activate the guild')
                .setRequired(true)
            )
        )
    );
  }

  public async serverActivate(
    interaction: Subcommand.ChatInputCommandInteraction
  ) {
    const password = interaction.options.getString('password', true);

    await deferReply(interaction);

    const { data, error } = await supabase
      .from('guilds')
      .select('id')
      .eq('activation_password', password)
      .single();

    if (error || !data) {
      return errorContainer(interaction, 'Invalid password');
    }

    const { error: guildUpdateError } = await supabase
      .from('guilds')
      .update({ active: true })
      .eq('id', data.id);

    if (guildUpdateError) {
      return errorContainer(interaction, guildUpdateError.message);
    }

    const container = new MessageContainer()
      .setHeading('Success', Emojis.valid)
      .setBody('Guild activated');

    return interaction.editReply(container.build('edit'));
  }
}

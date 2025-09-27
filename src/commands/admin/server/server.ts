import { Subcommand } from '@sapphire/plugin-subcommands';
import { deferReply } from '../../../utils/deferReply';
import { ServerCommandSubcommands } from './subcommands';

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

  public override async chatInputRun(
    interaction: Subcommand.ChatInputCommandInteraction
  ) {
    await deferReply(interaction);

    switch (interaction.options.getSubcommand()) {
      case 'activate':
        await ServerCommandSubcommands.activateSubcommand(interaction);
        return;
      default:
        await interaction.editReply('Unknown subcommand');
        return;
    }
  }
}

import { Command } from '@sapphire/framework';
import { ButtonStyle } from 'discord.js';
import { checkRoutingNumber } from '../../lib/routingNumber';
import { noIndent } from '../../utils/noIndent';
import { MessageContainer } from '../../utils/messageContainer';
import { Emojis } from '../../utils/emojis';
import { deferReply } from '../../utils/deferReply';

export class RoutingCommand extends Command {
  public constructor(context: Command.LoaderContext, options: Command.Options) {
    super(context, {
      ...options,
      name: 'routingnumber',
      description: 'Check a bank routing number',
      aliases: ['rn', 'routing'],
      cooldownDelay: 60_000,
      cooldownLimit: 3,
    });
  }

  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand((builder) =>
      builder
        .setName(this.name)
        .setDescription(this.description)
        .addStringOption((option) =>
          option
            .setName('routingnumber')
            .setDescription('The routing number to check')
            .setRequired(true)
        )
    );
  }

  public override async chatInputRun(
    interaction: Command.ChatInputCommandInteraction
  ) {
    const routingNumber = interaction.options.getString('routingnumber', true);

    await deferReply(interaction);

    const result = await checkRoutingNumber(routingNumber);
    const valid = result.valid;
    const location = `${result.city}, ${result.state} ${result.zip}` || 'N/A';

    const container = new MessageContainer()
      .setHeading(
        valid ? 'Valid Return' : 'Invalid Return',
        Emojis.getStatusEmoji(valid)
      )
      .setBody(
        valid
          ? noIndent`
        ## Returned Information:
        ) **\`Name:\`** ${result.name || 'N/A'}
        ) **\`Location:\`** ${location}`
          : noIndent`
        ### Returned Information:
        ) **\`Error\`**: ${result.error || 'Not found'}`
      );

    if (valid) {
      container.addButton({
        customId: `checkZip-${result.zip}`,
        label: 'Check ZIP',
        style: ButtonStyle.Primary,
      });
    }

    return interaction.editReply(container.build('edit'));
  }
}

import { ApplicationCommandRegistry, Command } from '@sapphire/framework';
import { ButtonStyle } from 'discord.js';
import { Emojis } from '../../utils/emojis';
import { MessageContainer } from '../../utils/messageContainer';
import { noIndent } from '../../utils/noIndent';
import { getPostalCodeData } from '../../lib/postalCode';
import { deferReply } from '../../utils/deferReply';

export class PostalCodeCommand extends Command {
  public constructor(context: Command.LoaderContext, options: Command.Options) {
    super(context, {
      ...options,
      name: 'postalcode',
      description: 'Check information about a postal code',
      cooldownDelay: 60_000,
      cooldownLimit: 3,
    });
  }

  public override registerApplicationCommands(
    registry: ApplicationCommandRegistry
  ) {
    registry.registerChatInputCommand((builder) =>
      builder
        .setName(this.name)
        .setDescription(this.description)
        .addStringOption((option) =>
          option
            .setName('postalcode')
            .setDescription('The postal code to check')
            .setRequired(true)
        )
    );
  }

  public override async chatInputRun(
    interaction: Command.ChatInputCommandInteraction
  ) {
    const postalCode = interaction.options.getString('postalcode', true);

    await deferReply(interaction);

    const result = await getPostalCodeData(postalCode);
    const dataFound = result.valid;
    const entry = result;

    const container = new MessageContainer()
      .setHeading(
        dataFound ? 'Valid Postal Code' : 'Invalid Postal Code',
        Emojis.getStatusEmoji(dataFound)
      )
      .setBody(
        dataFound
          ? noIndent`
                ## Returned Information:
                ) **\`ZIP Code:\`** ${entry.postalCode || 'N/A'} 
                ) **\`City:\`** ${entry.city || 'N/A'}, ${entry.stateAbb || 'N/A'}
                ) **\`State:\`** ${entry.state || 'N/A'}
                ) **\`County:\`** ${entry.county || 'N/A'}`
          : noIndent`
                ### Returned Information:
                ) **\`Error\`**: The postal code \`${postalCode}\` was not found.`
      );

    if (dataFound) {
      container.addButton({
        label: 'Check Google Maps',
        style: ButtonStyle.Link,
        url: `https://www.google.com/maps/search/${entry.postalCode}`,
      });
    }

    return await interaction.editReply(container.build('edit'));
  }
}

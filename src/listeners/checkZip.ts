import { Events, Listener } from '@sapphire/framework';
import { ButtonStyle, Interaction } from 'discord.js';
import { getPostalCodeData } from '../lib/postalCode';
import { Emojis } from '../utils/emojis';
import { MessageContainer } from '../utils/messageContainer';
import { noIndent } from '../utils/noIndent';

export class CheckZipListener extends Listener {
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

    if (interaction.customId.startsWith('checkZip-')) {
      const postalCode = interaction.customId.split('-')[1];

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

      return interaction.reply(container.build('reply'));
    } else return;
  }
}

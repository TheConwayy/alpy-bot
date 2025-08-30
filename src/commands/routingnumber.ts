import { Args, Command } from '@sapphire/framework';
import { Message, ChannelType, ButtonStyle } from 'discord.js';
import { checkRoutingNumber } from '../lib/routingNumber';
import { noIndent } from '../lib/noIndent';
import { MessageContainer } from '../lib/messageContainer';
import { Emojis } from '../lib/emojis';

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

  public override async messageRun(message: Message, args: Args): Promise<Message> {
    const routingNumber = await args.pick('string');
    
    // Use the newer typing indicator method
    if (message.channel.type !== ChannelType.DM && 
        message.channel.type !== ChannelType.GroupDM) {
      await message.channel.sendTyping();
    }
    
    const result = await checkRoutingNumber(routingNumber);
    const valid = result.valid
    const location = `${result.city}, ${result.state} ${result.zip}` || 'N/A'
    
    const container = new MessageContainer()
      .setHeading(
        valid ? 'Valid Return' : 'Invalid Return',
        Emojis.getStatusEmoji(valid)
      )
      .setBody(
        valid ? noIndent`
        ## Returned Information:
        ) **\`Name:\`** ${result.name || 'N/A'}
        ) **\`Location:\`** ${location}` : 
        noIndent`
        ### Returned Information:
        ) **\`Error\`**: ${result.error || 'Not found'}`
      )

    if (valid) {
      container.addButton({
        customId: `delete-response`,
        label: 'Delete Response',
        style: ButtonStyle.Danger
      })
    }

    return message.reply(container.build());
  }
}
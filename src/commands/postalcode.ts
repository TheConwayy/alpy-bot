import { Args, Command } from "@sapphire/framework";
import { ButtonStyle, ChannelType, Message } from "discord.js";
import { Emojis } from "../utils/emojis";
import { MessageContainer } from "../utils/messageContainer";
import { noIndent } from "../utils/noIndent";
import { getPostalCodeData } from "../lib/postalCode";

export class PostalCodeCommand extends Command {
    public constructor(context: Command.LoaderContext, options: Command.Options) {
        super(context, {
            ...options,
            name: 'postalcode',
            description: 'Check information about a postal code',
            aliases: ['postal', 'pc', 'zipcode', 'zip', 'z'],
            cooldownDelay: 60_000,
            cooldownLimit: 3
        });
    }

    public override async messageRun(message: Message, args: Args) {
        const postalCode = await args.pick('string');

        // Use the newer typing indicator method
        if (message.channel.type !== ChannelType.DM && 
            message.channel.type !== ChannelType.GroupDM) {
            await message.channel.sendTyping();
        }

        const result = await getPostalCodeData(postalCode);
        const dataFound = result.valid;
        const entry = result;

        const container = new MessageContainer()
            .setHeading(dataFound ? 'Valid Postal Code' : 'Invalid Postal Code', Emojis.getStatusEmoji(dataFound))
            .setBody(
                dataFound ? noIndent`
                ## Returned Information:
                ) **\`ZIP Code:\`** ${entry.postalCode || 'N/A'} 
                ) **\`City:\`** ${entry.city || 'N/A'}, ${entry.stateAbb || 'N/A'}
                ) **\`State:\`** ${entry.state || 'N/A'}
                ) **\`County:\`** ${entry.county || 'N/A'}` : 
                noIndent`
                ### Returned Information:
                ) **\`Error\`**: The postal code \`${postalCode}\` was not found.`
            )
        
        if (dataFound) {
            container.addButton({
                customId: 'delete-response',
                label: 'Delete Response',
                style: ButtonStyle.Danger
            })
            container.addButton({
                label: 'Check Google Maps',
                style: ButtonStyle.Link,
                url: `https://www.google.com/maps/search/${entry.postalCode}`
            })
        }

        return message.reply(container.build());
    }
}
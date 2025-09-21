import { Message } from 'discord.js';
import { Emojis } from '../../../../utils/emojis';
import { MessageContainer } from '../../../../utils/messageContainer';
import { noIndent } from '../../../../utils/noIndent';

type Command = {
  name: string;
  description: string;
  usage?: string;
};

const prefix = process.env.PREFIX;

const commands: Command[] = [
  {
    name: 'add',
    description: 'Add a universal setting',
    usage: 'add <setting-name> <setting-value>',
  },
  {
    name: 'remove',
    description: 'Remove a universal setting',
    usage: 'remove <setting-name>',
  },
  {
    name: 'edit',
    description: 'Edit a universal setting',
    usage: 'edit <setting-name> <setting-value>',
  },
  {
    name: 'get-all',
    description: 'Get all universal settings',
  },
];

function formatMessage(command: Command) {
  return noIndent`__**\`${prefix}${command.name}\`**__ - ${command.description}${command.usage ? `\n**Usage:** ${prefix}${command.usage}` : ''}`;
}

export async function handleHelp(message: Message) {
  const messageContainer = new MessageContainer()
    .setHeading('Help', Emojis.notepad)
    .setBody(commands.map((command) => formatMessage(command)).join('\n\n'));

  return message.reply(messageContainer.build());
}

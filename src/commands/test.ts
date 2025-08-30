import { Command } from '@sapphire/framework';
import { Message } from 'discord.js';

export class TestCommand extends Command {
	public constructor(context: Command.LoaderContext, options: Command.Options) {
		super(context, {
			...options,
			name: 'test',
			description: 'Just a quick test command'
		});
	}

	public override async messageRun(message: Message) {
		return message.reply("Wow you actually made something that works... I'm proud!");
	}
}

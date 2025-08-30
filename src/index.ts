import './lib/setup';

import { LogLevel, SapphireClient } from '@sapphire/framework';
import { GatewayIntentBits } from 'discord.js';

const client = new SapphireClient({
	defaultPrefix: process.env.NODE_ENV === 'development' ? '?' : '!',
	caseInsensitiveCommands: true,
	logger: {
		level: process.env.NODE_ENV === 'development' ? LogLevel.Debug : LogLevel.Info
	},
	intents: [GatewayIntentBits.DirectMessages, GatewayIntentBits.GuildMessages, GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent],
	loadMessageCommandListeners: true
});

const main = async () => {
	try {
		client.logger.info('Logging in');
		await client.login(process.env.DISCORD_TOKEN);
		client.logger.info('logged in');
	} catch (error) {
		client.logger.fatal(error);
		await client.destroy();
		process.exit(1);
	}
};

void main();

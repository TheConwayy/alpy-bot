import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, EmbedBuilder, Message } from 'discord.js';

export interface Question {
	key: string;
	text: string;
	skippable?: boolean;
}

/**
 * Run a survey in a channel.
 *
 * @param message The message that triggered this command. Used to get the channel.
 * @param questions An array of questions to ask the user.
 * @param startMessage Optional message to send before asking the questions.
 * @param endMessage Optional message to send after asking all the questions.
 * @returns An object with the answers, where the keys are the keys of the questions.
 */
export async function runSurvey(
	message: Message,
	questions: Question[],
	startMessage?: string,
	endMessage?: string
): Promise<Record<string, string | null>> {
	const channel = message.channel;

	if (channel.type !== ChannelType.GuildText) {
		return {};
	}
	const answers: Record<string, string | null> = {};

	await channel.send(startMessage || 'Please answer the following questions:');

	for (let i = 0; i < questions.length; i++) {
		const q = questions[i];
		const embed = new EmbedBuilder()
			.setTitle(`Question #${i + 1}`)
			.setDescription(q.text)
			.setColor('Aqua');

		const components = q.skippable
			? [
					new ActionRowBuilder<ButtonBuilder>().addComponents(
						new ButtonBuilder().setCustomId('skipQuestion').setLabel('Skip').setStyle(ButtonStyle.Secondary)
					)
				]
			: [];

		const questionMessage = await channel.send({
			embeds: [embed],
			components
		});

		const collected = await Promise.race([
			questionMessage
				.awaitMessageComponent({
					filter: (i) => i.customId === 'skipQuestion',
					time: 60_000
				})
				.catch(() => null),
			channel
				.awaitMessages({
					filter: (m) => m.author.id === message.author.id,
					max: 1,
					time: 60_000
				})
				.then((col) => col.first())
				.catch(() => null)
		]);

		if (!collected) {
			answers[q.key] = null;
		} else if ('customId' in collected && collected.customId === 'skipQuestion') {
			await collected.update({
				content: 'Skipped',
				embeds: [],
				components: []
			});
			answers[q.key] = null;
		} else {
			answers[q.key] = (collected as Message).content;
		}
	}

	await channel.send(endMessage || 'Survey complete. Thank you for your time!');
	return answers;
}

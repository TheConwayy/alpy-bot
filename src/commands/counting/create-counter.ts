import { Command } from '@sapphire/framework';
import { Question, runSurvey } from '../../utils/surveyHelper';
import { Message } from 'discord.js';
import { createCounter } from '../../lib/counters';
import { MessageContainer } from '../../utils/messageContainer';
import { Emojis } from '../../utils/emojis';

const questions: Question[] = [
  {
    key: 'counter_name',
    text: 'What is the name of the counter?',
  },
  {
    key: 'counter_description',
    text: 'What is the description of the counter?',
    skippable: true,
  },
];

export class CreateCounterCommand extends Command {
  public constructor(context: Command.LoaderContext, options: Command.Options) {
    super(context, {
      ...options,
      name: 'create-counter',
      description: 'Create a new counter',
    });
  }

  public override async messageRun(message: Message) {
    const answers = await runSurvey(
      message,
      questions,
      'Please answer the following questions:',
      "All questions have been answered!\nDon't forget to init the counters!"
    );

    if (!answers.counter_name || !answers.counter_description) {
      return await message.reply(
        'Please provide a name and description for the counter.'
      );
    }

    const formattedAnswer = answers.counter_name
      .split(' ')
      .join('_')
      .toLowerCase();

    const { success, error } = await createCounter(
      message.author.id,
      formattedAnswer,
      answers.counter_description
    );

    const conatiner = new MessageContainer()
      .setHeading(
        success ? 'Success' : 'Error',
        success ? Emojis.valid : Emojis.invalid
      )
      .setBody(
        success
          ? `Successfully created counter \`${formattedAnswer}\`.`
          : `Failed to create counter \`${formattedAnswer}\`.\n**\`Error:\`** ${error}`
      );

    return await message.reply(conatiner.build());
  }
}

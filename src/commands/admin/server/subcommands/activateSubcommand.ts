import { Subcommand } from '@sapphire/plugin-subcommands';
import { supabase } from '../../../../lib/supabaseClient';
import { Emojis } from '../../../../utils/emojis';
import { errorContainer } from '../../../../utils/errorContainer';
import { MessageContainer } from '../../../../utils/messageContainer';

export async function activateSubcommand(
  interaction: Subcommand.ChatInputCommandInteraction
) {
  const password = interaction.options.getString('password', true);

  const { data, error } = await supabase
    .from('guilds')
    .select('id')
    .eq('activation_password', password)
    .single();

  if (error || !data) {
    return errorContainer(interaction, 'Invalid password');
  }

  const { error: guildUpdateError } = await supabase
    .from('guilds')
    .update({ active: true, last_edited_by: interaction.user.id })
    .eq('id', data.id);

  if (guildUpdateError) {
    return errorContainer(interaction, guildUpdateError.message);
  }

  const container = new MessageContainer()
    .setHeading('Success', Emojis.valid)
    .setBody('Guild activated');

  return interaction.editReply(container.build('edit'));
}

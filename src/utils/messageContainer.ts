import { ButtonBuilder } from '@discordjs/builders';
import {
  ActionRowBuilder,
  APIMessageComponentEmoji,
  ButtonStyle,
  ContainerBuilder,
  InteractionEditReplyOptions,
  InteractionReplyOptions,
  MessageFlags,
  MessageReplyOptions,
  SeparatorBuilder,
  TextDisplayBuilder,
} from 'discord.js';

type ButtonOptions =
  | {
      label: string;
      style: ButtonStyle.Link;
      url: string;
      customId?: never;
      emoji?: APIMessageComponentEmoji;
      disabled?: boolean;
    }
  | {
      label: string;
      style?: Exclude<ButtonStyle, ButtonStyle.Link>;
      customId: string;
      url?: never;
      emoji?: APIMessageComponentEmoji;
      disabled?: boolean;
    };

export class MessageContainer {
  private container: ContainerBuilder;
  private hasVisibleSeparator: boolean = false;
  private hasInvisibleSeparator: boolean = false;

  constructor() {
    this.container = new ContainerBuilder();
  }

  /**
   * Set heading text
   * @param text Text for the heading
   * @param emoji (Optional) Emoji for the heading
   * @returns Heading for message
   */
  public setHeading(text: string, emoji?: string): this {
    const heading = new TextDisplayBuilder().setContent(
      emoji ? `# ${emoji} ${text}` : `# ${text}`
    );
    this.container.addTextDisplayComponents(heading);
    return this;
  }

  /**
   * Set message body
   * @param text Text for the body
   * @returns Message body
   */
  public setBody(text: string): this {
    const body = new TextDisplayBuilder().setContent(text);

    // Add visible separator if heading exists and there is not one already
    if (!this.hasVisibleSeparator && this.container.components.length > 0) {
      this.addVisibleSeparator();
    }

    this.container.addTextDisplayComponents(body);
    return this;
  }

  public addButton(options: ButtonOptions): this {
    const button = new ButtonBuilder()
      .setLabel(options.label)
      .setStyle(options.style || ButtonStyle.Primary);

    if (options.customId) {
      button.setCustomId(options.customId);
    }

    if (options.emoji) {
      button.setEmoji(options.emoji);
    }

    if (options.disabled) {
      button.setDisabled(true);
    }

    if (options.url && options.style === ButtonStyle.Link) {
      button.setURL(options.url);
    }

    if (!this.hasInvisibleSeparator) {
      this.addInvisibleSeparator();
    }

    // Check for action row
    let actionRow: ActionRowBuilder<ButtonBuilder> | undefined;

    for (const component of this.container.components) {
      if (component instanceof ActionRowBuilder) {
        actionRow = component as ActionRowBuilder<ButtonBuilder>;
        break;
      }
    }

    if (!actionRow) {
      actionRow = new ActionRowBuilder<ButtonBuilder>();
      this.container.addActionRowComponents(actionRow);
    }

    actionRow.addComponents(button);
    return this;
  }

  /**
   * Add visible separator
   * @returns Visible separator component
   */
  public addVisibleSeparator(): this {
    const visibleSep = new SeparatorBuilder().setSpacing(2);
    this.container.addSeparatorComponents(visibleSep);
    this.hasVisibleSeparator = true;
    return this;
  }

  /**
   * Add invisible separator
   * @returns Invisible separator component
   */
  public addInvisibleSeparator(): this {
    const invisibleSep = new SeparatorBuilder().setDivider(false);
    this.container.addSeparatorComponents(invisibleSep);
    this.hasInvisibleSeparator = true;
    return this;
  }

  public build(type: 'reply'): InteractionReplyOptions;
  public build(type: 'message'): MessageReplyOptions;
  public build(type: 'edit'): InteractionEditReplyOptions;
  public build(
    type: 'reply' | 'message' | 'edit'
  ):
    | InteractionReplyOptions
    | MessageReplyOptions
    | InteractionEditReplyOptions {
    const base = {
      components: [this.container],
      flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2],
    };

    switch (type) {
      case 'reply':
        return base as InteractionReplyOptions;
      case 'message':
        return base as MessageReplyOptions;
      case 'edit':
        return {
          flags: [MessageFlags.IsComponentsV2],
          components: [this.container],
        } as InteractionEditReplyOptions;
    }
  }
}

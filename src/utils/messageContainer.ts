import { ButtonBuilder } from "@discordjs/builders";
import { ActionRowBuilder, APIMessageComponentEmoji, ButtonStyle, ContainerBuilder, MessageFlags, MessageReplyOptions, SeparatorBuilder, TextDisplayBuilder } from "discord.js";

export class MessageContainer {
    private container: ContainerBuilder
    private hasVisibleSeparator: boolean = false
    private hasInvisibleSeparator: boolean = false

    constructor() {
        this.container = new ContainerBuilder()
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
        )
        this.container.addTextDisplayComponents(heading);
        return this
    }

    /**
     * Set message body
     * @param text Text for the body
     * @returns Message body
     */
    public setBody(text: string): this {
        const body = new TextDisplayBuilder().setContent(text)

        // Add visible separator if heading exists and there is not one already
        if (!this.hasVisibleSeparator && this.container.components.length > 0) {
            this.addVisibleSeparator()
        }

        this.container.addTextDisplayComponents(body)
        return this
    }

    public addButton(options: {
        customId: string;
        label: string;
        style?: ButtonStyle
        emoji?: APIMessageComponentEmoji;
        disabled?: boolean
    }): this {
        const button = new ButtonBuilder()
            .setCustomId(options.customId)
            .setLabel(options.label)
            .setStyle(options.style || ButtonStyle.Primary)

        if (options.emoji) {
            button.setEmoji(options.emoji)
        }

        if (options.disabled) {
            button.setDisabled(true)
        }

        if (!this.hasInvisibleSeparator) {
            this.addInvisibleSeparator()
        }

        // Check for action row
        let actionRow: ActionRowBuilder<ButtonBuilder> | undefined;

        for (const component of this.container.components) {
            if (component instanceof ActionRowBuilder) {
                actionRow = component as ActionRowBuilder<ButtonBuilder>
                break;
            }
        }

        if (!actionRow) {
            actionRow = new ActionRowBuilder<ButtonBuilder>()
            this.container.addActionRowComponents(actionRow)
        }

        actionRow.addComponents(button)
        return this
    }

    /**
     * Add visible separator
     * @returns Visible separator component
     */
    public addVisibleSeparator(): this {
        const visibleSep = new SeparatorBuilder().setSpacing(2)
        this.container.addSeparatorComponents(visibleSep)
        this.hasVisibleSeparator = true
        return this
    }

    /**
     * Add invisible separator
     * @returns Invisible separator component
     */
    public addInvisibleSeparator(): this {
        const invisibleSep = new SeparatorBuilder().setDivider(false)
        this.container.addSeparatorComponents(invisibleSep)
        this.hasInvisibleSeparator = true
        return this
    }

    public build(): MessageReplyOptions {
  return {
    flags: MessageFlags.IsComponentsV2,
    components: [this.container]
  };
}
}
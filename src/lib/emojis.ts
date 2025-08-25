export class Emojis {
    // Status emojis
    static readonly invalid = '<:invalid:1409395235334787092>'
    static readonly valid = '<:valid:1409395223670296618>'

    // Misc emojis
    static readonly arrow = '<a:arrow:1409408504569270365>'

    // Helper method for getting status emoji
    static getStatusEmoji(isValid: boolean): string {
        return isValid ? this.valid : this.invalid
    }
}
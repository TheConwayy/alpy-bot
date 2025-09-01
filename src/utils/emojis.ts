const dev = process.env.NODE_ENV === 'development';

export class Emojis {
	// Status emojis
	static readonly valid = dev ? '<:yes:1411182793450324138>' : '<:yes:1411181713396207657>';
	static readonly invalid = dev ? '<:no:1411160727984799814>' : '<:no:1411181733575000216>';

	// Misc emojis
	static readonly arrow = dev ? '<a:arrow:1411160702059679895>' : '<a:arrow:1409408504569270365>';
	static readonly notepad = dev ? '<:notepad:1412132387252600949>' : '<:notepad:1412132442390794280>';

	// Helper method for getting status emoji
	static getStatusEmoji(isValid: boolean): string {
		return isValid ? this.valid : this.invalid;
	}
}

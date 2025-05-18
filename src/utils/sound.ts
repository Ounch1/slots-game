import { Howl } from 'howler';
const sounds: Record<string, Howl> = {};

export const sound = {
	add: (alias: string, url: string): void => {
		console.log(`Sound added: ${alias} from ${url}`);
		sounds[alias] = new Howl({ src: [url] });
	},

	play: (alias: string): void => {
		const sfx: Howl = sounds[alias];
		if (sfx) {
			console.log(`Playing sound: ${alias}`);
			sfx.play();
		} else {
			console.warn(`Sound alias "${alias}" not found.`);
		}
	},

	stop: (alias: string): void => {
		const sfx: Howl = sounds[alias];
		if (sfx) {
			console.log(`Stopping sound: ${alias}`);
			sfx.stop();
		} else {
			console.warn(`Sound alias "${alias}" not found.`);
		}
	},

	get: (alias: string): Howl | undefined => sounds[alias],
};

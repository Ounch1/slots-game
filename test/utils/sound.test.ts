import { sound } from '@/utils/sound';

jest.mock('howler', () => {
	return {
		Howl: jest.fn().mockImplementation(() => ({
			play: jest.fn(),
			stop: jest.fn(),
		})),
	};
});

describe('sound module', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	test('adds a sound and stores it', () => {
		let sfx = sound.get('testSound');
		expect(sfx).not.toBeDefined();

		sound.add('testSound', 'test-url.mp3');
		sfx = sound.get('testSound');

		expect(sfx).toBeDefined();
	});

	test('plays the sound if it exists', () => {
		sound.add('testSound', 'test-url.mp3');
		const sfx = sound.get('testSound');

		expect(sfx).toBeDefined();

		if (sfx) {
			const playSpy = jest.spyOn(sfx, 'play');
			sound.play('testSound');
			expect(playSpy).toHaveBeenCalled();

			playSpy.mockRestore();
		}
	});

	test('doesnt play the sound if it doesnt exist', () => {
		sound.add('testSound', 'test-url.mp3');
		const sfx = sound.get('testSound');

		expect(sfx).toBeDefined();

		if (sfx) {
			const playSpy = jest.spyOn(sfx, 'play');
			const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

			const soundId = 'non-added sound';
			sound.play(soundId);
			expect(playSpy).not.toHaveBeenCalled();
			expect(warnSpy).toHaveBeenCalledWith(
				`Sound alias "${soundId}" not found.`
			);

			playSpy.mockRestore();
			warnSpy.mockRestore();
		}
	});

	test('stops the sound if it exists', () => {
		sound.add('testSound', 'test-url.mp3');
		const sfx = sound.get('testSound');

		expect(sfx).toBeDefined();

		if (sfx) {
			const stopSpy = jest.spyOn(sfx, 'stop');
			sound.stop('testSound');
			expect(stopSpy).toHaveBeenCalled();
			stopSpy.mockRestore();
		}
	});

	test('does not stop the sound if it does not exist', () => {
		sound.add('testSound', 'test-url.mp3');
		const sfx = sound.get('testSound');

		expect(sfx).toBeDefined();

		if (sfx) {
			const stopSpy = jest.spyOn(sfx, 'stop');
			const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

			const soundId = 'non-added sound';
			sound.stop(soundId);
			expect(stopSpy).not.toHaveBeenCalled();
			expect(warnSpy).toHaveBeenCalledWith(
				`Sound alias "${soundId}" not found.`
			);

			stopSpy.mockRestore();
			warnSpy.mockRestore();
		}
	});

	test('get returns undefined if sound does not exist', () => {
		expect(sound.get('missingSound')).toBeUndefined();
	});

	test('get returns the stored Howl instance after add', () => {
		sound.add('testSound', 'test-url.mp3');
		const sfx = sound.get('testSound');
		expect(sfx).toBeDefined();
	});
});

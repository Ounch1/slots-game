import type { Config } from 'jest';

const config: Config = {
	preset: 'ts-jest',
	testEnvironment: 'jsdom',
	setupFiles: ['jest-canvas-mock'],
	verbose: true,
	moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
	moduleNameMapper: {
		'^@/(.*)$': '<rootDir>/src/$1',
	},
	testPathIgnorePatterns: ['<rootDir>/e2e/'],
};

export default config;

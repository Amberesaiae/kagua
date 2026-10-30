import { defineConfig } from 'vitest/config';

// Only pure logic is unit-tested here; screens run in Expo.
export default defineConfig({ test: { include: ['src/**/*.test.ts'] } });

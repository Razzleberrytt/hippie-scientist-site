# Global search first-interaction boundary

The shared navigation keeps only lightweight search triggers and one keyboard listener in the initial client path. The heavier command-palette dialog is dynamically imported after the first explicit search interaction and rendered through a body portal so the sticky navigation's backdrop filter cannot create an incorrect fixed-position containing block.

Regression ownership lives in `components/__tests__/navigation-search-defer.test.ts`.

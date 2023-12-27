import { DEFAULT_OPTIONS } from './types';

chrome.runtime.onInstalled.addListener(async () => {
  await chrome.storage.sync.set(DEFAULT_OPTIONS);
});

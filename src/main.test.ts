import { describe, expect, it } from 'vitest';
import { execute } from './main';

describe('terminal navigation', () => {
  it('renders help output for help', () => { execute('help'); expect(document.body.textContent).toContain('commands: help'); });
  it('responds helpfully to unknown commands', () => { execute('warp-drive'); expect(document.body.textContent).toContain('command not found: warp-drive'); });
  it('navigates to a known section', () => { execute('about'); expect(document.querySelector('[aria-label="about section"]')).toBeTruthy(); });

  it('opens the section picker with the keyboard shortcut', () => {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }));
    expect(document.querySelector('[role="dialog"]')).toBeTruthy();
  });
});

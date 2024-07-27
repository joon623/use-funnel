import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, test } from 'vitest';
import mockRouter from 'next-router-mock';

import { useFunnel } from '../src/index.js';

describe('Test useFunnel next router', () => {
  test('should work', async () => {
    function FunnelTest() {
      const funnel = useFunnel<{
        A: { id?: string };
        B: { id: string };
        C: { id: string; password: string };
      }>({
        id: 'vitest',
        initial: {
          step: 'A',
          context: {},
        },
      });

      switch (funnel.step) {
        case 'A': {
          return (
            <button
              onClick={() => {
                funnel.history.push('B', { id: 'vitest' });
              }}
            >
              Go B
            </button>
          );
        }
        case 'B': {
          return (
            <div>
              <div>{funnel.context.id}</div>
              <button
                onClick={() => {
                  funnel.history.replace('C', { password: 'vitest1234' });
                }}
              >
                Go C
              </button>
            </div>
          );
        }
        case 'C': {
          return (
            <div>
              <div>Finished!</div>
            </div>
          );
        }
        default: {
          throw new Error('Invalid step');
        }
      }
    }

    render(<FunnelTest />);

    expect(screen.queryByText('Go B')).not.toBeNull();

    const user = userEvent.setup();
    await user.click(screen.getByText('Go B'));

    expect(screen.queryByText('vitest')).not.toBeNull();
    expect(mockRouter.query['funnel.vitest.index']).toBe(1);
    expect(JSON.parse(mockRouter.query['funnel.vitest.histories'] as string)).toEqual([
      { step: 'A', context: {} },
      { step: 'B', context: { id: 'vitest' } },
    ]);

    await user.click(screen.getByText('Go C'));

    expect(screen.queryByText('Finished!')).not.toBeNull();
    expect(mockRouter.query['funnel.vitest.index']).toBe(1);
    expect(JSON.parse(mockRouter.query['funnel.vitest.histories'] as string)).toEqual([
      { step: 'A', context: {} },
      { step: 'C', context: { id: 'vitest', password: 'vitest1234' } },
    ]);
  });
});

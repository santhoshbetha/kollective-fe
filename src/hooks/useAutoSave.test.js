import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useAutoSaveForm } from './useAutoSave';

describe('useAutoSaveForm', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('triggers onSave after a delay when values change', async () => {
    const onSave = vi.fn().mockResolvedValue();
    const { result } = renderHook(() => useAutoSaveForm({ name: 'Old' }, onSave));

    // Simulate user typing
    act(() => {
      result.current.handleChange({ target: { name: 'name', value: 'New' } });
    });

    expect(onSave).not.toHaveBeenCalled(); // Should not save immediately

    // Advance time by 1 second to trigger the debounce
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(onSave).toHaveBeenCalledWith({ name: 'New' });
  });
});

/*
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom

*/

/*
 GitHub Action to automatically run these tests every time you push code to your Soapbox repo

.github/workflows/test.yml

1. Create the Workflow File
In your project root, create a new directory and file at .github/workflows/test.yml. GitHub Actions automatically looks for YAML workflow files in this specific path.
.github/workflows/test.yml

name: Run Tests

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20' # Match your local Node version
          cache: 'npm'

      - name: Install Dependencies
        run: npm ci # Faster, cleaner install for CI environments

      - name: Run Vitest
        run: npm run test

2. Configure the "Test" Script
Ensure your package.json has a test script that runs Vitest in "run" mode (not watch mode)
 for CI environments like GitHub.
 
package.jso

"scripts": {
  "test": "vitest run"
}

3. Why This Workflow is Essential

    Early Detection: Catch bugs in your shared useTimeline or EntityCard logic the moment code is pushed before it reaches production.
    PR Feedback: Provides immediate feedback on pull requests; if a test fails, GitHub will mark the check as failed and can prevent merging.
    Efficiency: Automates the testing process, saving manual effort every time you update a component in the features directory.

4. Verifying the Run
After you push this file to your repository:

    Navigate to the Actions tab in your GitHub repository.
    Select the "Run Tests" workflow.
    Click on a specific run to see live logs of your unit tests executing.
*/

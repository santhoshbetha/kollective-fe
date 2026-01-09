import React from "react";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeEach, vi } from "vitest";
import useDebouncedSearch from "../hooks/useDebouncedSearch";
import useSearchStore from "../stores/searchStore";

function TestComponent({ delay = 200 }) {
  const { value, setValue, results, isLoading } = useDebouncedSearch({
    initialValue: "",
    filter: "statuses",
    delay,
  });
  return (
    <div>
      <input
        aria-label="search-input"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <div data-testid="loading">{isLoading ? "loading" : "idle"}</div>
      <div data-testid="count">{results.statuses.length}</div>
    </div>
  );
}

describe("useDebouncedSearch hook", () => {
  beforeEach(() => {
    useSearchStore.setState({
      value: "",
      filter: "statuses",
      accountId: null,
      results: { accounts: [], statuses: [] },
      next: null,
      isLoading: false,
      searchCache: {},
      _pendingSearchTimers: {},
      _pendingSearchPromises: {},
      helpers: {},
    });
  });

  it("debounces and updates results", async () => {
    // use real timers in the test environment
    const fakeData = { accounts: [], statuses: [{ id: "s1" }, { id: "s2" }] };
    const fakeApi = {
      get: async () => ({
        next: () => null,
        json: async () => fakeData,
      }),
    };

    useSearchStore.getState().setHelpers({ api: fakeApi });

    render(<TestComponent delay={200} />);

    const input = screen.getByLabelText("search-input");

    await act(async () => {
      await userEvent.type(input, "hello");
    });

    // fast-forward time to trigger debounce
    // wait for debounce to trigger (slightly longer than delay)
    await act(async () => {
      await new Promise((r) => setTimeout(r, 400));
    });

    expect(screen.getByTestId("count").textContent).toBe("2");

    vi.useRealTimers();
  });
});

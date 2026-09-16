"use client";

import { useCallback, useEffect, useReducer, useRef } from "react";

interface SelectorState {
  open: boolean;
  input: string;
  search: string;
  offset: number;
  limit: number;
}
type Action =
  | { type: "open"; open: boolean }
  | { type: "input"; value: string }
  | { type: "search"; value: string }
  | { type: "page"; offset: number; limit: number };
function reducer(state: SelectorState, action: Action): SelectorState {
  switch (action.type) {
    case "open":
      return { ...state, open: action.open };
    case "input":
      return { ...state, input: action.value };
    case "search":
      return { ...state, search: action.value, offset: 0 };
    case "page":
      return { ...state, offset: action.offset, limit: action.limit };
  }
}
export function usePageRedirectSelector() {
  const [state, dispatch] = useReducer(reducer, {
    open: false,
    input: "",
    search: "",
    offset: 0,
    limit: 6,
  });
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  const setSearch = useCallback((value: string) => {
    dispatch({ type: "input", value });
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(
      () => dispatch({ type: "search", value: value.trim() }),
      300,
    );
  }, []);
  return {
    state,
    setSearch,
    setOpen: (open: boolean) => dispatch({ type: "open", open }),
    setPage: (offset: number, limit: number) =>
      dispatch({ type: "page", offset, limit }),
  };
}

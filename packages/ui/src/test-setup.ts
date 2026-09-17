import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
afterEach(cleanup);
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    addEventListener() {},
    removeEventListener() {},
  }),
});
Object.defineProperty(Element.prototype, "scrollIntoView", {
  value() {},
  configurable: true,
});
Object.defineProperty(Element.prototype, "hasPointerCapture", {
  value() {
    return false;
  },
  configurable: true,
});
Object.defineProperty(Element.prototype, "releasePointerCapture", {
  value() {},
  configurable: true,
});
class TestResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
Object.defineProperty(globalThis, "ResizeObserver", {
  value: TestResizeObserver,
  configurable: true,
});

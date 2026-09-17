import { act, renderHook } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";
import { I18nProvider } from "../../../../apps/next-app/src/lib/i18n/client";
import { usePageEditor } from "../../../../apps/next-app/src/hooks/use-page-editor";

const mocks = vi.hoisted(() => ({
  create: vi.fn(),
  update: vi.fn(),
  push: vi.fn(),
  preview: vi.fn(),
  data: undefined as unknown,
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: mocks.push }) }));
vi.mock("@/src/lib/catalog-preview", () => ({
  createCatalogPreview: (...args: unknown[]) => mocks.preview(...args),
}));
vi.mock("@/src/lib/trpc", () => ({
  trpc: {
    useUtils: () => ({
      page: { list: { invalidate: vi.fn() }, getById: { invalidate: vi.fn() } },
    }),
    page: {
      getById: { useQuery: () => ({ data: mocks.data, isLoading: false }) },
      create: { useMutation: () => ({ mutateAsync: mocks.create }) },
      update: { useMutation: () => ({ mutateAsync: mocks.update }) },
      uploadPreview: {
        useMutation: () => ({ mutateAsync: vi.fn(), isPending: false }),
      },
    },
  },
}));
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <I18nProvider initialLocale="en">{children}</I18nProvider>
);
beforeEach(() => {
  vi.clearAllMocks();
  mocks.data = undefined;
  mocks.create.mockResolvedValue({ id: "created", contentRevision: 1 });
  mocks.update.mockResolvedValue({ id: "existing", contentRevision: 3 });
  mocks.preview.mockResolvedValue(undefined);
});
it("creates a published page with editor HTML/design and the chosen redirect URL", async () => {
  const { result } = renderHook(() => usePageEditor({}), { wrapper });
  result.current.editorHtmlRef.current = "<main>Training</main>";
  result.current.editorDesignRef.current = { pages: [{ id: "root" }] };
  await act(async () =>
    result.current.handleSubmit({
      name: "  Sign in  ",
      path: "login",
      type: "LANDING",
      status: "ACTIVE",
      redirectUrl: "https://example.com/learn",
      redirectPageId: null,
    }),
  );
  expect(mocks.create).toHaveBeenCalledWith({
    name: "Sign in",
    path: "login",
    type: "LANDING",
    status: "ACTIVE",
    html: "<main>Training</main>",
    design: { pages: [{ id: "root" }] },
    redirectUrl: "https://example.com/learn",
    redirectPageId: null,
  });
  expect(mocks.push).toHaveBeenCalledWith("/pages/created");
});
it("updates an existing draft with its internal redirect without navigating away", async () => {
  mocks.data = {
    id: "existing",
    name: "Draft",
    path: null,
    type: "REDIRECT",
    status: "DRAFT",
    html: "<p>Original</p>",
    design: {},
    redirectUrl: null,
    redirectPageId: "target",
    contentRevision: 2,
  };
  const { result } = renderHook(() => usePageEditor({ pageId: "existing" }), {
    wrapper,
  });
  await act(async () =>
    result.current.handleSubmit({
      name: "Draft",
      path: null,
      type: "REDIRECT",
      status: "DRAFT",
      redirectUrl: null,
      redirectPageId: "target",
    }),
  );
  expect(mocks.update).toHaveBeenCalledWith(
    expect.objectContaining({
      id: "existing",
      status: "DRAFT",
      redirectUrl: null,
      redirectPageId: "target",
      html: "<p>Original</p>",
    }),
  );
  expect(mocks.push).not.toHaveBeenCalled();
});

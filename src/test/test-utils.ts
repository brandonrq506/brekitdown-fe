import { createTestProviders } from "./test-providers";

import { type RenderOptions, render } from "@testing-library/react";
import type { ReactElement } from "react";

interface CustomRenderOptions extends Omit<RenderOptions, "wrapper"> {
  initialEntries?: string[];
}

const customRender = (ui: ReactElement, options: CustomRenderOptions = {}) => {
  const { initialEntries, ...renderOptions } = options;
  const { queryClient, router, TestProviders } = createTestProviders(initialEntries);

  return {
    ...render(ui, { wrapper: TestProviders, ...renderOptions }),
    queryClient,
    router,
  };
};

export * from "@testing-library/react";
export { customRender as render };

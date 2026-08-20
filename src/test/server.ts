import { setupServer } from "msw/node";

// TODO: Setup proper handlers once the API is ready to be tested
export const server = setupServer(...[]);

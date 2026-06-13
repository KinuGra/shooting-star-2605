import { defineConfig } from "orval";

export default defineConfig({
  api: {
    input: {
      target: "http://localhost:8080/api-docs",
    },
    output: {
      mode: "tags-split",
      target: "src/api/generated",
      schemas: "src/api/model",
      client: "swr",
      httpClient: "fetch",
      override: {
        mutator: {
          path: "src/api/fetcher.ts",
          name: "customFetch",
        },
      },
    },
  },
  zod: {
    input: {
      target: "http://localhost:8080/api-docs",
    },
    output: {
      client: "zod",
      target: "src/api/zod.generated.ts",
    },
  },
});

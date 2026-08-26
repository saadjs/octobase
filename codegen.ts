import type { CodegenConfig } from "@graphql-codegen/cli";

// Schema ships locally with @octokit/graphql-schema, so codegen needs no token.
const config: CodegenConfig = {
  schema: "./node_modules/@octokit/graphql-schema/schema.graphql",
  documents: ["src/**/*.graphql"],
  ignoreNoDocuments: true,
  generates: {
    "./src/gql/": {
      preset: "client",
      presetConfig: { fragmentMasking: false },
      config: {
        useTypeImports: true,
        scalars: { DateTime: "string", URI: "string" },
      },
    },
  },
};

export default config;

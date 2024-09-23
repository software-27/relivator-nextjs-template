import { defineCommand, runMain } from "citty";
import consola from "consola";
import pc from "picocolors";

import { defineAddon } from "@/scripts/utils";

const main = defineCommand({
  meta: {
    name: "relimter",
    description: "@reliverse/addons-relimter/putout",
    version: "0.0.0-canary.0",
  },
  async run() {
    const message = defineAddon(
      "📦",
      "@reliverse/addons-relimter/putout",
      "codemod tasks to apply",
      "<enter>",
    );

    const selected = await consola.prompt(message, {
      options: ["all", "exit"] as const,
      type: "select",
    });

    switch (selected) {
      case "all":
        await import("./tasks");
        break;

      case "exit":
        break;

      default:
        break;
    }

    consola.success(
      pc.dim("@reliverse/addons-relimter/putout finished successfully"),
    );
  },
});

runMain(main);

export default main;

import fs from "fs-extra";
import { join } from "pathe";

import { getRootDirname } from "@reliverse/fs";

const loadEnv = async () => {
  const rootDirectory = getRootDirname(import.meta.url, 6);
  const envFilePath = join(rootDirectory, ".env");

  if (fs.existsSync(envFilePath)) {
    const envConfig = fs.readFileSync(envFilePath, "utf8");

    for (const line of envConfig.split("\n")) {
      const [key, ...rest] = line.split("=");
      const value = rest.join("=").trim();

      if (key) {
        // process.env[key.trim()] = value === "" ? undefined : value;

        process.env[key.trim()] = value === '""' ? "" : value;
      }
    }
  }
};

export default loadEnv;

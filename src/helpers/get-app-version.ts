import { readFileSync } from "node:fs";
import { resolve } from "node:path";

interface IPackageJson {
  version?: string;
}

let cachedVersion: string | null = null;

const getAppVersion = (): string => {
  if (cachedVersion) {
    return cachedVersion;
  }

  try {
    const packagePath: string = resolve(process.cwd(), "package.json");
    const packageJson: IPackageJson = JSON.parse(
      readFileSync(packagePath, "utf-8"),
    );

    cachedVersion = packageJson.version || "1.0.0";

    return cachedVersion;
  } catch (_error) {
    return "1.0.0";
  }
};

export default getAppVersion;

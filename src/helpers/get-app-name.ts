import { readFileSync } from "node:fs";
import { resolve } from "node:path";

interface IPackageJson {
  name?: string;
}

let cachedName: string | null = null;

const getAppName = (): string => {
  if (cachedName) {
    return cachedName;
  }

  try {
    const packagePath: string = resolve(process.cwd(), "package.json");
    const packageJson: IPackageJson = JSON.parse(
      readFileSync(packagePath, "utf-8"),
    );

    cachedName = packageJson.name || "app";

    return cachedName;
  } catch (_error) {
    return "app";
  }
};

export default getAppName;

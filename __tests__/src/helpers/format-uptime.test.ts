import { describe, test, expect } from "vitest";

import formatUptime from "@/helpers/format-uptime";
import translate from "@/helpers/translate";

describe("src/helpers/format-uptime.ts", () => {
  test("should format uptime with milliseconds only", () => {
    const uptime = 0.123;
    const result = formatUptime(uptime);

    expect(result).toBe("00:00:00.123");
  });

  test("should format uptime with seconds", () => {
    const uptime = 45.5;
    const result = formatUptime(uptime);

    expect(result).toBe("00:00:45.500");
  });

  test("should format uptime with minutes", () => {
    const uptime = 125.5;
    const result = formatUptime(uptime);

    expect(result).toBe("00:02:05.500");
  });

  test("should format uptime with hours", () => {
    const uptime = 3665.5;
    const result = formatUptime(uptime);

    expect(result).toBe("01:01:05.500");
  });

  test("should format uptime with 1 day", () => {
    const uptime = 90065.5;
    const result = formatUptime(uptime);

    expect(result).toBe(`1 ${translate("time.day")} 01:01:05.500`);
  });

  test("should format uptime with multiple days", () => {
    const uptime = 176465.5;
    const result = formatUptime(uptime);

    expect(result).toBe(`2 ${translate("time.days")} 01:01:05.500`);
  });

  test("should handle 0 uptime", () => {
    const uptime = 0;
    const result = formatUptime(uptime);

    expect(result).toBe("00:00:00.000");
  });
});

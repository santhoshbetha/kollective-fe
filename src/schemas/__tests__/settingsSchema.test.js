import { describe, it, expect } from "vitest";
import { settingsSchema } from "../settings";

describe("settings schema", () => {
  it("parses discloseClient and locale with defaults", () => {
    const parsed = settingsSchema.parse({});
    expect(parsed.discloseClient).toBe(true);
    expect(parsed.locale).toBe("en");
  });

  it("accepts provided values", () => {
    const parsed = settingsSchema.parse({
      discloseClient: true,
      locale: "fr-FR",
    });
    expect(parsed.discloseClient).toBe(true);
    expect(parsed.locale).toBe("fr-FR");
  });
});

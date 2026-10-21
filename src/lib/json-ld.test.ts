import { describe, expect, it } from "vite-plus/test";
import { jsonLd } from "./json-ld";

describe("jsonLd", () => {
  it("cannot be closed early by text containing a script tag", () => {
    const output = jsonLd({ name: "</script><script>alert(1)</script>" });

    expect(output).not.toContain("<");
    expect(JSON.parse(output).name).toBe("</script><script>alert(1)</script>");
  });
});

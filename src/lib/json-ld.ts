// Serializes structured data for an inline <script>; "<" is escaped so text can never close the tag.
export const jsonLd = (data: unknown) => JSON.stringify(data).replaceAll("<", "\\u003c");

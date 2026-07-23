export function normalizeEventLabel(value: string) {
  const normalizedWhitespace = value.trim().replace(/\s+/g, " ");

  return normalizedWhitespace.replace(/\p{L}/u, (letter) =>
    letter.toLocaleUpperCase("it-IT"),
  );
}

export function normalizeEventAddress(value: string) {
  const normalizedAddress = normalizeEventLabel(value);
  const civicNumberMatch = normalizedAddress.match(
    /^(.+?)(?:,\s*|\s+)(\d+(?:[/-][\p{L}\d]+)?(?:\s+(?:bis|ter|quater))?)$/iu,
  );

  if (!civicNumberMatch) {
    return normalizedAddress;
  }

  const [, street, civicNumber] = civicNumberMatch;

  return `${street.trim()}, ${civicNumber}`;
}

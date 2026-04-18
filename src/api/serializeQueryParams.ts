/**
 * Serializes GET params so `null` is sent as an empty value (e.g. `leagueId=`)
 * instead of omitting the key (axios default). Use for endpoints that expect
 * explicit null league id (overall standings).
 */
export function serializeQueryParamsWithNull(
  params: Record<string, unknown>,
): string {
  const parts: string[] = [];
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) continue;
    const k = encodeURIComponent(key);
    if (value === null) {
      parts.push(`${k}=`);
    } else {
      parts.push(`${k}=${encodeURIComponent(String(value))}`);
    }
  }
  return parts.join("&");
}

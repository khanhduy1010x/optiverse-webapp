export function decodeBase64Utf8(input: string): string {
  if (!input) return '';
  // Normalize URL-safe base64 and add padding
  let b64 = input.replace(/-/g, '+').replace(/_/g, '/');
  const pad = b64.length % 4;
  if (pad) b64 += '='.repeat(4 - pad);

  try {
    // atob -> binary string
    const binary = atob(b64);
    // Use TextDecoder on bytes
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return new TextDecoder('utf-8').decode(bytes);
  } catch (e1) {
    try {
      // Fallback: percent-encoding trick
      const binary = atob(b64);
      const percentEncoded = Array.prototype.map
        .call(
          binary,
          (c: string) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        )
        .join('');
      return decodeURIComponent(percentEncoded);
    } catch (e2) {
      // As a last resort, return empty string to avoid corrupt UI
      console.error('decodeBase64Utf8 failed:', e1, e2);
      return '';
    }
  }
}

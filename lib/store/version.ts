/** Short content hash shared by the browser and the disk store. A mismatch means the page changed. */
export function versionOf(content: string): string {
  let h1 = 0x811c9dc5;
  let h2 = 0x811c9dc5 ^ content.length;
  for (let index = 0; index < content.length; index += 1) {
    const code = content.charCodeAt(index);
    h1 ^= code;
    h1 = Math.imul(h1, 0x01000193);
    h2 ^= code + index;
    h2 = Math.imul(h2, 0x01000193);
  }
  return `${(h1 >>> 0).toString(16).padStart(8, "0")}${(h2 >>> 0).toString(16).padStart(8, "0")}`;
}

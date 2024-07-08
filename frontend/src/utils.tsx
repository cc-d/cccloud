interface cccSecret {
  secret: string;
  encSecret: string;
  fsSecret: string;
}
export const sha256 = async (t: string): Promise<number[]> => {
  const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(t));
  return Array.from(new Uint8Array(b));
};

export const getSecret = async (t: string): Promise<cccSecret> => {
  const hash = await sha256(t);
  return {
    secret: b58enc(new Uint8Array(hash)),
    encSecret: b58enc(new Uint8Array(hash.slice(0, 16))),
    fsSecret: b58enc(new Uint8Array(hash.slice(16, 32))),
  };
};

export const b58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
export const map = new Map(b58.split('').map((c, i) => [c, i]));

export const b58enc = (i: Uint8Array | string): string => {
  const b = typeof i === 'string' ? new TextEncoder().encode(i) : i;
  const d: number[] = [0];
  (b as Uint8Array).forEach((byte: number) => {
    let c = byte;
    for (let j = 0; j < d.length; ++j) {
      c += d[j] << 8;
      d[j] = c % 58;
      c = (c / 58) | 0;
    }
    while (c) {
      d.push(c % 58);
      c = (c / 58) | 0;
    }
  });
  return d
    .reverse()
    .map((d) => b58[d])
    .join('');
};

export const b58dec = (i: Uint8Array | string): Uint8Array => {
  const str = typeof i === 'string' ? i : new TextDecoder().decode(i);
  const bytes: number[] = [0];
  for (const char of str) {
    let c = map.get(char) ?? -1;
    if (c === -1) throw new Error('Invalid character');
    for (let j = 0; j < bytes.length; ++j) {
      c += bytes[j] * 58;
      bytes[j] = c & 0xff;
      c = c >> 8;
    }
    while (c) {
      bytes.push(c & 0xff);
      c = c >> 8;
    }
  }
  return new Uint8Array(bytes.reverse());
};

export function createTTL(ttl: number, maxRandomOffset: number): number {
  const randomOffset = Math.floor(Math.random() * maxRandomOffset);
  const ttlWithOffset = ttl + randomOffset;

  return ttlWithOffset;
}

import { BlockList, isIP } from 'node:net';

// Follow a proxy chain only when the actual socket peer is explicitly trusted.
// Deployment must overwrite or append the actual upstream peer to XFF.
export function trustedClientResolver(ranges = [], header = 'x-forwarded-for') {
  if (!['x-forwarded-for', 'x-real-ip', 'cf-connecting-ip'].includes(header)) throw new Error('Unsupported client header');
  const trusted = new BlockList();
  for (const range of ranges) {
    const [raw, prefix, extra] = range.split('/');
    const family = isIP(raw);
    if (!family || extra !== undefined || (prefix !== undefined && (!/^\d+$/.test(prefix) || +prefix > (family === 4 ? 32 : 128)))) throw new Error('Invalid trusted proxy range');
    if (prefix === undefined) trusted.addAddress(raw, family === 4 ? 'ipv4' : 'ipv6');
    else trusted.addSubnet(raw, +prefix, family === 4 ? 'ipv4' : 'ipv6');
  }
  const clean = value => {
    if (typeof value !== 'string' || value.length > 45) return null;
    if (value.startsWith('::ffff:') && isIP(value.slice(7)) === 4) return value.slice(7);
    return isIP(value) && !value.includes('%') ? value : null;
  };
  const contains = ip => trusted.check(ip, isIP(ip) === 4 ? 'ipv4' : 'ipv6');
  return (peer, headers) => {
    let current = clean(peer);
    if (!current) return null;
    if (!contains(current)) return current;
    const raw = headers.get(header);
    if (!raw || raw.length > 1024) return null;
    const hops = raw.split(',').map(x => clean(x.trim()));
    if (hops.length > 16 || hops.some(x => !x) || (header !== 'x-forwarded-for' && hops.length !== 1)) return null;
    for (let i = hops.length - 1; i >= 0; i--) {
      if (!contains(current)) break;
      current = hops[i];
    }
    return current;
  };
}

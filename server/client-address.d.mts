export function trustedClientResolver(ranges?: readonly string[], header?: string): (peer: string | null | undefined, headers: Headers) => string | null;

export class ApiError extends Error { status: number; code: string; retryAfter?: number; constructor(status: number, code: string, message: string, retryAfter?: number); }
export interface Guard { acquire(address: string | null): () => void; stats(): { clients: number; inFlight: number; maxClients: number; maxInFlight: number }; }
export interface GuardOptions { clock?: () => number; secret?: string | Uint8Array; maxClients?: number; maxInFlight?: number; clientInterval?: number; clientBurst?: number; globalInterval?: number; globalBurst?: number; ttl?: number; }
export function networkPrefix(address: unknown): string | null;
export function createGuard(options?: GuardOptions): Guard;
export function apiResponse(data: unknown, status?: number, extra?: Record<string, string>): Response;
export function errorResponse(error: unknown): Response;
export function readJson(request: Request, options?: { maxBytes?: number; timeoutMs?: number }): Promise<Record<string, unknown>>;
export function onlyKeys(value: object, allowed: string[]): void;
export function dateParts(value: unknown, options?: { birth?: boolean; now?: Date }): { year: number; month: number; day: number };
export function withGuard(request: Request, address: string | null, guard: Guard, method: string, run: () => object | Promise<object>): Promise<Response>;

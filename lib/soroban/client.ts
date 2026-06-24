import Server from "@stellar/stellar-sdk";
import { createSorobanRpcOptimizer } from "./rpcOptimization";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SorobanServer = Server as any;

/**
 * Default RPC URL for Soroban (Futurenet).
 * Can be overridden by NEXT_PUBLIC_SOROBAN_RPC_URL in .env.local.
 */
export const DEFAULT_RPC_URL = "https://rpc.futurenet.stellar.org";

/**
 * Default network passphrase for Futurenet.
 * Can be overridden by NEXT_PUBLIC_SOROBAN_NETWORK_PASSPHRASE in .env.local.
 */
export const DEFAULT_NETWORK_PASSPHRASE = "Test SDF Future Network ; October 2022";

/**
 * Retrieves the RPC URL from environment or uses the default.
 */
function getRpcUrl(): string {
  return process.env.NEXT_PUBLIC_SOROBAN_RPC_URL ?? DEFAULT_RPC_URL;
}

/**
 * Retrieves the network passphrase from environment or uses the default.
 */
function getNetworkPassphrase(): string {
  return process.env.NEXT_PUBLIC_SOROBAN_NETWORK_PASSPHRASE ?? DEFAULT_NETWORK_PASSPHRASE;
}

/**
 * Creates a Soroban Server instance for the configured RPC URL.
 * Uses the same Server API as soroban-client (stellar-sdk is the maintained package).
 */
let sharedServer: any | null = null;
let sharedServerRpcUrl: string | null = null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createSorobanServer(): any {
  const rpcUrl = getRpcUrl();
  if (sharedServer && sharedServerRpcUrl === rpcUrl) {
    return sharedServer;
  }

  sharedServer = new SorobanServer(rpcUrl);
  sharedServerRpcUrl = rpcUrl;
  return sharedServer;
}

/**
 * Returns the configured network passphrase (Futurenet/Testnet).
 */
export function getSorobanNetworkPassphrase(): string {
  return getNetworkPassphrase();
}

/**
 * Returns the configured RPC URL.
 */
export function getSorobanRpcUrl(): string {
  return getRpcUrl();
}

let sharedOptimizer: ReturnType<typeof createSorobanRpcOptimizer> | null = null

export function getSorobanRpcOptimizer(): ReturnType<typeof createSorobanRpcOptimizer> {
  if (!sharedOptimizer) {
    sharedOptimizer = createSorobanRpcOptimizer({
      primaryRpcUrl: getRpcUrl(),
      fallbackRpcUrl: process.env.NEXT_PUBLIC_SOROBAN_FALLBACK_RPC_URL,
      debounceMs: Number(process.env.NEXT_PUBLIC_SOROBAN_DEBOUNCE_MS ?? 50),
      ttlMs: Number(process.env.NEXT_PUBLIC_SOROBAN_READ_TTL_MS ?? 30_000),
    })
  }

  return sharedOptimizer
}

export async function readSorobanContractState<T>(request: {
  key: string
  method: string
  params?: unknown[]
  parser?: (response: unknown) => unknown
}): Promise<T> {
  return getSorobanRpcOptimizer().readContractState<T>(request)
}

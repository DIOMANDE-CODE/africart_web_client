/**
 * Backward-compatibility shim.
 * The canonical axios instance now lives in src/lib/api.ts.
 * All existing imports of "../services/api" continue to work unchanged.
 */
export { default } from '../lib/api';


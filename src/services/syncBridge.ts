/**
 * Sync Bridge Service
 * Decouples useSimulationStore and useAuthStore to avoid circular imports.
 * Dispatches non-blocking background synchronization and career promotion logging.
 */

export interface PromotionLogPayload {
  previousTitle: string;
  newTitle: string;
  previousSalary: number;
  newSalary: number;
  hikePercentage: number;
  bonusAmount: number;
  lifestyleChoice: string;
  monthSimulated: number;
}

type SyncCallback = () => void;
type PromotionCallback = (data: PromotionLogPayload) => void;

let autoSyncFn: SyncCallback | null = null;
let logPromotionFn: PromotionCallback | null = null;

export const registerSyncCallbacks = (sync: SyncCallback, promo: PromotionCallback) => {
  autoSyncFn = sync;
  logPromotionFn = promo;
};

export const requestBackgroundSync = () => {
  if (autoSyncFn) {
    try {
      autoSyncFn();
    } catch (e) {
      console.warn('Background auto-sync suppressed error:', e);
    }
  }
};

export const requestPromotionLog = (data: PromotionLogPayload) => {
  if (logPromotionFn) {
    try {
      logPromotionFn(data);
    } catch (e) {
      console.warn('Background promotion log suppressed error:', e);
    }
  }
};

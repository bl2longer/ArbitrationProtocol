import { EvmChallengePayload } from "@/services/evm/hooks/useSignTypedData";
import { useBehaviorSubject } from "@/utils/useBehaviorSubject";
import { useCallback } from "react";
import { BehaviorSubject } from "rxjs";
import { fetchBackendArbiterStatus as fetchArbiterStatus, upsertBackendArbiter as upsertArbiter } from "../arbiter-backend.service";
import { ArbiterStatusDTO } from "../dto/arbiter-status.dto";

const state$ = new BehaviorSubject<{
  isFetchingStatus: boolean;
  isUpserting: boolean;
  status?: ArbiterStatusDTO;
}>({ isFetchingStatus: false, isUpserting: false });

export const useBackendArbiter = (arbiterAddress: string) => {
  const state = useBehaviorSubject(state$);

  const fetchBackendArbiterStatus = useCallback(async () => {
    state$.next({ ...state$.value, isFetchingStatus: true });
    const status = await fetchArbiterStatus(arbiterAddress);
    state$.next({ ...state$.value, isFetchingStatus: false, status });
  }, [arbiterAddress]);

  const upsertBackendArbiter = useCallback(async (email: string, evmChallengePayload: EvmChallengePayload, signature: string): Promise<boolean> => {
    state$.next({ ...state$.value, isUpserting: true });
    if (await upsertArbiter(arbiterAddress, email, evmChallengePayload, signature)) {
      state$.next({
        ...state$.value, isUpserting: false, status: {
          ...state$.value.status, emailKnown: true
        }
      });
      return true;
    }
    else {
      state$.next({ ...state$.value, isUpserting: false });
      return false;
    }
  }, [arbiterAddress]);

  return { ...state, fetchBackendArbiterStatus, upsertBackendArbiter };
}
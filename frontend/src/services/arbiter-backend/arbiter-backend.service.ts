import { EvmChallengePayload } from "../evm/hooks/useSignTypedData";
import { ArbiterRegistrationDTO } from "./dto/arbiter-registration.dto";
import { ArbiterStatusDTO } from "./dto/arbiter-status.dto";

export const arbiterBackendEndpoint = import.meta.env.VITE_APP_ARBITER_BACKEND_ENDPOINT!;

const backendGet = async <T>(path: string): Promise<T> => {
  const response = await fetch(`${arbiterBackendEndpoint}${path}`);
  if (!response.ok) {
    console.error(`Failed to get ${path}: ${response.statusText}`);
    return undefined;
  }
  return response.json() as T;
}

const backendPost = async <BodyType, ReturnType = unknown>(path: string, body: BodyType): Promise<ReturnType> => {
  console.log("body", body)
  const response = await fetch(`${arbiterBackendEndpoint}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    console.error(`Failed to post ${path}: ${response.statusText}`);
    return undefined;
  }

  return response.json() as ReturnType;
}

export const fetchBackendArbiterStatus = async (arbiterAddress: string): Promise<ArbiterStatusDTO> => {
  const status = await backendGet<ArbiterStatusDTO>(`/registration/arbiter/status?owner=${arbiterAddress}`);
  return status;
}

export const upsertBackendArbiter = async (ownerAddress: string, email: string, evmChallengePayload: EvmChallengePayload, signature: string): Promise<ArbiterStatusDTO> => {
  const result = await backendPost<ArbiterRegistrationDTO, ArbiterStatusDTO>(
    `/registration/arbiter`,
    { ownerAddress, email, evmChallengePayload, signature }
  );
  return result;
}
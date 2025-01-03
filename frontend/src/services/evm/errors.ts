import { Interface } from "ethers";
import arbitratorManagerContract from "../../../contracts/core/ArbitratorManager.sol/ArbitratorManager.json";
import compensationManagerContract from "../../../contracts/core/CompensationManager.sol/CompensationManager.json";
import transactionManagerContract from "../../../contracts/core/TransactionManager.sol/TransactionManager.json";

const abis = [
  arbitratorManagerContract.abi,
  transactionManagerContract.abi,
  compensationManagerContract.abi
];

/**
 * From an error thrown by a smart contract, extract relevant error information (especially 
 * error codes) by looking at error code signatures in multiple ABIs potentially used by the contracts
 * we call but also by their dependencies.
 */
export const deepABIErrorExtract = (e: any) => {
  const data = e?.error?.data?.data || e?.error?.data || e?.data;

  for (const abi of abis) {
    try {
      const iface = new Interface(abi);
      return iface.parseError(data);
    } catch (err) {
      // Ignore the error and try the next ABI
    }
  }

  console.warn("No matching contract error found in app ABIs registered for deep extraction, for error data:", data);

  return null;
}
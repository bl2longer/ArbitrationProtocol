import { DApp as DAppDTO } from "@/services/subgraph/dto/dapp";
import { Expose } from "class-transformer";

export enum DAppStatus {
  None = 'None',
  Pending = 'Pending',
  Active = 'Active',
  Suspended = 'Suspended',
  Terminated = 'Terminated'
}

export class DApp implements Omit<DAppDTO, "status"> {
  @Expose() public id: string;
  @Expose() public address: string;
  @Expose() public owner: string;
  @Expose() public status: DAppStatus;
}
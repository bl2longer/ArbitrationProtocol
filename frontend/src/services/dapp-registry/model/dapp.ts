import { DApp as DAppDTO } from "@/services/subgraph/dto/dapp";
import { Expose } from "class-transformer";

export class DApp implements DAppDTO {
  @Expose() public id: string;
  @Expose() public address: string;
  @Expose() public owner: string;
  @Expose() public status: string;
}
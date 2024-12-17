/**
 * APIs to fetch subgraph info such as arbitrators, transactions, compensations, etc.
 */

import { ChainConfig } from '@/services/chains/chain-config';
import { ArbitratorInfo } from '../arbitrators/model/arbitrator-info';
import { dtoToClass } from '../class-transformer/class-transformer-utils';
import { ArbitratorInfo as ArbitratorInfoDTO } from './dto/arbitrator-info';

type GraphQLResponse<T> = {
  data: T;
  errors?: Array<{ message: string }>;
}

type FetchArbitratorsResponse = GraphQLResponse<{
  arbitratorInfos: ArbitratorInfoDTO[];
}>;

export enum OrderStatusFilter {
  ALL, // Show all orders
  OPEN, // Show only open orders
  ON_GOING // Show order that are neither open nor closed (in between, processing)
}

/**
 * Fetch all arbitrators from the subsgraph.
 */
export const fetchArbitrators = async (chain: ChainConfig, start: number, limit: number): Promise<{ arbitrators: ArbitratorInfo[], total: number }> => {
  try {
    const resultsPerPage = 100;
    let startAt = 0;
    let pageArbitrators: ArbitratorInfoDTO[] = [];
    let total: number = 0;

    while (true) {
      const query = `query FetchArbitrators {
        arbitratorInfos (
          skip: ${startAt}
          first:${resultsPerPage}
          orderBy: createdAt,
          orderDirection: desc
        ) { 
          id 
          createdAt 
          status 
          address 
          ethAmount 
          lastArbitrationTime 
          currentFeeRate 
          pendingFeeRate 
          activeTransactionId 
          operatorEvmAddress 
          operatorBtcAddress 
          operatorBtcPubKey
        }
      }`;

      const response = await fetch(chain.subgraph.endpoint, {
        method: 'POST',
        body: JSON.stringify({ query: query }),
        headers: new Headers({ 'Content-Type': 'application/json' })
      });

      const gqlResponse: FetchArbitratorsResponse = await response.json();

      if (gqlResponse.errors?.length > 0) {
        for (const error of gqlResponse.errors)
          console.error("Subgraph error:", new Error(error?.message));
      }

      const data = gqlResponse?.data;
      pageArbitrators.push(...(data?.arbitratorInfos || []));
      total += pageArbitrators?.length || 0;

      if (pageArbitrators.length < resultsPerPage) {
        // No more page to fetch
        break;
      }

      startAt += resultsPerPage;
    }

    const arbitratorInfos = pageArbitrators.slice(start, start + limit);

    console.log("Fetched arbitrators:", arbitratorInfos);

    return {
      arbitrators: arbitratorInfos.map(a => dtoToClass(a, ArbitratorInfo)),
      total
    };
  } catch (error) {
    console.error("Error fetching arbitrators:", error);
    return undefined;
  }
}

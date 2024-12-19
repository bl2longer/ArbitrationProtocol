import { ChainConfig } from '@/services/chains/chain-config';
import { ArbitratorInfo } from '../arbitrators/model/arbitrator-info';
import { dtoToClass } from "../class-transformer/class-transformer-utils";
import { ArbitratorInfo as ArbitratorInfoDTO } from '../subgraph/dto/arbitrator-info';
import { SubgraphGQLResponse } from '../subgraph/gql-response';

type FetchArbitratorsResponse = SubgraphGQLResponse<{
  arbitratorInfos: ArbitratorInfoDTO[];
}>;

/**
 * Fetch all arbitrators from the subsgraph.
 */
export const fetchArbitrators = async (chain: ChainConfig, start = 0, limit = 100, operatorEvmAddress?: string): Promise<{ arbitrators: ArbitratorInfo[], total: number }> => {
  let whereQuery: string = "";
  if (operatorEvmAddress)
    whereQuery += ` operatorEvmAddress: "${operatorEvmAddress.toLowerCase()}"`;

  let whereClause: string = !whereQuery ? "" : `where: { ${whereQuery} }`;

  try {
    const resultsPerPage = 1000;
    let startAt = 0;
    let pageArbitrators: ArbitratorInfoDTO[] = [];
    let total = 0;

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const query = `query FetchArbitrators {
        arbitratorInfos (
          skip: ${startAt}
          first:${resultsPerPage}
          orderBy: createdAt,
          orderDirection: desc
          ${whereClause}
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
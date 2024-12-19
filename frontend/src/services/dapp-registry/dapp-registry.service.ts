import { ChainConfig } from '@/services/chains/chain-config';
import { DApp as DAppDTO } from '..//subgraph/dto/dapp';
import { dtoToClass } from "../class-transformer/class-transformer-utils";
import { SubgraphGQLResponse } from '../subgraph/gql-response';
import { DApp } from './model/dapp';

type FetchDAppsResponse = SubgraphGQLResponse<{
  dapps: DAppDTO[];
}>;

/**
 * Fetch all dapps from the subsgraph.
 */
export const fetchDApps = async (chain: ChainConfig, start: number, limit: number): Promise<{ dapps: DApp[], total: number }> => {
  try {
    const resultsPerPage = 1000;
    let startAt = 0;
    let pageDApps: DAppDTO[] = [];
    let total = 0;

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const query = `query FetchDApps {
        dapps (
          skip: ${startAt}
          first:${resultsPerPage}
          orderBy: createdAt,
          orderDirection: desc
        ) { 
          id address owner status
        }
      }`;

      const response = await fetch(chain.subgraph.endpoint, {
        method: 'POST',
        body: JSON.stringify({ query: query }),
        headers: new Headers({ 'Content-Type': 'application/json' })
      });

      const gqlResponse: FetchDAppsResponse = await response.json();

      if (gqlResponse.errors?.length > 0) {
        for (const error of gqlResponse.errors)
          console.error("Subgraph error:", new Error(error?.message));
      }

      const data = gqlResponse?.data;
      pageDApps.push(...(data?.dapps || []));
      total += pageDApps?.length || 0;

      if (pageDApps.length < resultsPerPage) {
        // No more page to fetch
        break;
      }

      startAt += resultsPerPage;
    }

    const dapps = pageDApps.slice(start, start + limit);

    console.log("Fetched dapps:", dapps);

    return {
      dapps: dapps.map(a => dtoToClass(a, DApp)),
      total
    };
  } catch (error) {
    console.error("Error fetching dapps:", error);
    return undefined;
  }
}
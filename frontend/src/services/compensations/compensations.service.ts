import { ChainConfig } from '@/services/chains/chain-config';
import { dtoToClass } from "../class-transformer/class-transformer-utils";
import { CompensationClaim } from '../compensations/model/compensation-claim';
import { CompensationClaim as CompensationClaimDTO } from '../subgraph/dto/compensation-claim';
import { SubgraphGQLResponse } from '../subgraph/gql-response';

type FetchCompensationsResponse = SubgraphGQLResponse<{
  compensations: CompensationClaimDTO[];
}>;

/**
 * Fetch all arbiters from the subgraph.
 */
export const fetchCompensations = async (chain: ChainConfig, start = 0, limit = 100): Promise<{ compensations: CompensationClaim[], total: number }> => {
  try {
    const resultsPerPage = 1000;
    let startAt = 0;
    let pageCompensations: CompensationClaimDTO[] = [];
    let total = 0;

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const query = `query FetchCompensations {
        compensationClaims (
          skip: ${startAt}
          first:${resultsPerPage}
          orderBy: createdAt,
          orderDirection: desc
        ) { 
          id 
          createdAt 
          claimer
          claimType
          withdrawn
          arbiter
          amount
          evidence
        }
      }`;

      const response = await fetch(chain.subgraph.endpoint, {
        method: 'POST',
        body: JSON.stringify({ query: query }),
        headers: new Headers({ 'Content-Type': 'application/json' })
      });

      const gqlResponse: FetchCompensationsResponse = await response.json();

      if (gqlResponse.errors?.length > 0) {
        for (const error of gqlResponse.errors)
          console.error("Subgraph error:", new Error(error?.message));
      }

      const data = gqlResponse?.data;
      pageCompensations.push(...(data?.compensations || []));
      total += pageCompensations?.length || 0;

      if (pageCompensations.length < resultsPerPage) {
        // No more page to fetch
        break;
      }

      startAt += resultsPerPage;
    }

    const compensations = pageCompensations.slice(start, start + limit);

    console.log("Fetched compensations:", compensations);

    return {
      compensations: compensations.map(c => dtoToClass(c, CompensationClaim)),
      total
    };
  } catch (error) {
    console.error("Error fetching compensations:", error);
    return undefined;
  }
}
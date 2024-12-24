import { ChainConfig } from '@/services/chains/chain-config';
import { dtoToClass } from "../class-transformer/class-transformer-utils";
import { BPosNFT as BPosNFTDTO } from '../subgraph/dto/bpos-nft';
import { SubgraphGQLResponse } from '../subgraph/gql-response';
import { BPosNFT } from './model/bpos-nft';

type FetchBPosNFTsResponse = SubgraphGQLResponse<{
  bposNFTs: BPosNFTDTO[];
}>;

export type FetchBPosNftsQueryParams = {
  ownerAddress: string;
}

/**
 * Fetch all BPoS NFT from the subgraph.
 */
export const fetchBPosNfts = async (chain: ChainConfig, start = 0, limit = 100, queryParams: FetchBPosNftsQueryParams): Promise<{ bposNfts: BPosNFT[], total: number }> => {
  let whereQuery = "";

  if (queryParams.ownerAddress)
    whereQuery += ` owner: "${queryParams.ownerAddress.toLowerCase()}"`;

  let whereClause: string = !whereQuery ? "" : `where: { ${whereQuery} }`;

  try {
    const resultsPerPage = 1000;
    let startAt = 0;
    let pageBPosNfts: BPosNFTDTO[] = [];
    let total = 0;

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const query = `query BPosNFT {
        bposNFTs (
          skip: ${startAt}
          first:${resultsPerPage}
          orderBy: createdAt,
          orderDirection: desc
          ${whereClause}
        ) { 
          id createdAt owner tokenId
        }
      }`;

      const response = await fetch(chain.subgraph.endpoint, {
        method: 'POST',
        body: JSON.stringify({ query: query }),
        headers: new Headers({ 'Content-Type': 'application/json' })
      });

      const gqlResponse: FetchBPosNFTsResponse = await response.json();

      if (gqlResponse.errors?.length > 0) {
        for (const error of gqlResponse.errors)
          console.error("Subgraph error:", new Error(error?.message));
      }

      const data = gqlResponse?.data;
      pageBPosNfts.push(...(data?.bposNFTs || []));
      total += pageBPosNfts?.length || 0;

      if (pageBPosNfts.length < resultsPerPage) {
        // No more page to fetch
        break;
      }

      startAt += resultsPerPage;
    }

    const bposNfts = pageBPosNfts.slice(start, start + limit);

    console.log("Fetched BPos NFTs:", bposNfts);

    return {
      bposNfts: bposNfts.map(a => dtoToClass(a, BPosNFT)),
      total
    };
  } catch (error) {
    console.error("Error fetching BPos NFTs:", error);
    return undefined;
  }
}
import type { FetchSignerArgs, FetchSignerResult, Signer } from '@wagmi/core'
import { fetchSigner, watchSigner } from '@wagmi/core';
import { useQueryClient } from 'vue-query';
import { tryOnScopeDispose } from '@vueuse/core';
import { useAccount } from './useAccount'
import type { QueryConfig, QueryFunctionArgs } from '../../types';
import { useQuery, useChainId } from '../utils';
import { get } from '@vueuse/core';

export type UseSignerConfig = Omit<
  QueryConfig<FetchSignerResult, Error>,
  'cacheTime' | 'staleTime' | 'enabled'
> &
  FetchSignerArgs

export const queryKey = ({ chainId }: FetchSignerArgs ) => [{ entity: 'signer', chainId, persist: false }] as const;

function queryFn<TSigner extends Signer>({
  queryKey: [{ chainId }],
}: QueryFunctionArgs<typeof queryKey>) {
  return fetchSigner<TSigner>({ chainId })
}

export function useSigner<TSigner extends Signer>({
  chainId: chainId_,
  suspense,
  onError,
  onSettled,
  onSuccess,
}: UseSignerConfig = {}) {
  const { connector } = useAccount()
  const chainId = useChainId({ chainId: chainId_ })
  const signerQuery = useQuery(queryKey({ chainId: chainId_ }), queryFn, {
    enabled: Boolean(connector),
    suspense,
    cacheTime: 0,
    staleTime: 0,
    onError,
    onSettled,
    onSuccess,
  });

  const queryClient = useQueryClient();
  const unwatch = watchSigner({ chainId : get(chainId) }, signer => 
    queryClient.setQueryData(queryKey({ chainId : get(chainId) }), signer),
    );

  tryOnScopeDispose(() => {
    unwatch();
  });

  return signerQuery;
}

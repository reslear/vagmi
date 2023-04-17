import type { FetchSignerArgs, FetchSignerResult, Signer } from '@wagmi/core';
import { fetchSigner, watchSigner } from '@wagmi/core';
import { useQueryClient } from 'vue-query';
import { get, tryOnScopeDispose } from '@vueuse/core';
import type { QueryConfig, QueryFunctionArgs } from '../../types';
import { useChainId, useQuery } from '../utils';
import { useAccount } from './useAccount';

export type UseSignerConfig = Omit<
  QueryConfig<FetchSignerResult, Error>,
  'cacheTime' | 'staleTime' | 'enabled'
> &
FetchSignerArgs;

export function queryKey({ chainId }: FetchSignerArgs) {
  return [{ entity: 'signer', chainId, persist: false }] as const;
}

function queryFn<TSigner extends Signer>({
  queryKey: [{ chainId }],
}: QueryFunctionArgs<typeof queryKey>) {
  return fetchSigner<TSigner>({ chainId });
}

export function useSigner<TSigner extends Signer>({
  chainId: chainId_,
  suspense,
  onError,
  onSettled,
  onSuccess,
}: UseSignerConfig = {}) {
  const { connector } = useAccount();
  const chainId = useChainId({ chainId: chainId_ });
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
  const unwatch = watchSigner({ chainId: get(chainId) }, signer =>
    queryClient.setQueryData(queryKey({ chainId: get(chainId) }), signer),
  );

  tryOnScopeDispose(() => {
    unwatch();
  });

  return signerQuery;
}

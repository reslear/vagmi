import type { FetchEnsNameArgs, FetchEnsNameResult } from '@wagmi/core';
import { fetchEnsName } from '@wagmi/core';
import { computed, reactive } from 'vue';
import { useQuery } from '../utils/useQuery';

import type { QueryConfig, QueryFunctionArgs, SetMaybeRef } from '../../types';
import { getMaybeRefValue } from '../../utils';
import { useChainId } from '../utils';

export type UseEnsNameArgs = Partial<FetchEnsNameArgs>;

export type UseEnsNameConfig = QueryConfig<FetchEnsNameResult, Error>;

type Address = `0x${string}`;

export function queryKey({
  address,
  chainId,
}: {
  address?: Address
  chainId?: number
}) {
  return [{ entity: 'ensName', address, chainId }] as const;
}

function queryFn({
  queryKey: [{ address }],
}: QueryFunctionArgs<typeof queryKey>) {
  if (!address)
    throw new Error('address is required');
  return fetchEnsName({ address });
}

export function useEnsName({
  address,
  cacheTime,
  chainId: chainId_,
  enabled = true,
  staleTime = 1_000 * 60 * 60 * 24, // 24 hours
  suspense,
  onError,
  onSettled,
  onSuccess,
}: SetMaybeRef<UseEnsNameArgs & UseEnsNameConfig> = {}) {
  const chainId = useChainId({ chainId: chainId_ });

  const options = reactive({
    queryKey: computed(() => queryKey({ address: getMaybeRefValue(address), chainId: getMaybeRefValue(chainId) })),
    queryFn,
    cacheTime,
    enabled: computed(() => {
      return Boolean(getMaybeRefValue(enabled) && getMaybeRefValue(address) && getMaybeRefValue(chainId));
    }),
    staleTime,
    suspense,
    onError,
    onSettled,
    onSuccess,
  });

  return useQuery(options);
}

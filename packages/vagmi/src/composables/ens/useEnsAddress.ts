import type {
  FetchEnsAddressArgs,
  FetchEnsAddressResult,
} from '@wagmi/core';
import {
  fetchEnsAddress,
} from '@wagmi/core';
import { computed, reactive } from 'vue';
import { useQuery } from '../utils/useQuery';

import type { QueryConfig, QueryFunctionArgs, SetMaybeRef } from '../../types';
import { getMaybeRefValue } from '../../utils';
import { useChainId } from '../utils';

export type UseEnsAddressArgs = Partial<FetchEnsAddressArgs>;

export type UseEnsAddressConfig = QueryConfig<FetchEnsAddressResult, Error>;

export function queryKey({
  chainId,
  name,
}: {
  chainId?: number
  name?: string
}) {
  return [{ entity: 'ensAddress', chainId, name }] as const;
}

function queryFn({
  queryKey: [{ chainId, name }],
}: QueryFunctionArgs<typeof queryKey>) {
  if (!name)
    throw new Error('name is required');
  return fetchEnsAddress({ chainId, name });
}

export function useEnsAddress({
  cacheTime,
  chainId: chainId_,
  enabled = true,
  name,
  staleTime = 1_000 * 60 * 60 * 24, // 24 hours
  suspense,
  onError,
  onSettled,
  onSuccess,
}: SetMaybeRef<UseEnsAddressArgs & UseEnsAddressConfig> = {}) {
  const chainId = useChainId({ chainId: chainId_ });

  const options = reactive({
    queryKey: computed(() => queryKey({ chainId: getMaybeRefValue(chainId), name: getMaybeRefValue(name) })),
    queryFn,
    cacheTime,
    enabled: computed(() => {
      return Boolean(getMaybeRefValue(enabled) && getMaybeRefValue(name) && getMaybeRefValue(chainId));
    }),
    staleTime,
    suspense,
    onError,
    onSettled,
    onSuccess,
  });

  return useQuery(options);
}

import type {
  FetchEnsAvatarArgs,
  FetchEnsAvatarResult,
} from '@wagmi/core';
import {
  fetchEnsAvatar,
} from '@wagmi/core';
import { computed, reactive } from 'vue';
import { useQuery } from '../utils/useQuery';

import type { QueryConfig, QueryFunctionArgs, SetMaybeRef } from '../../types';
import { getMaybeRefValue } from '../../utils';
import { useChainId } from '../utils';

export type UseEnsAvatarArgs = Partial<FetchEnsAvatarArgs>;

export type UseEnsLookupConfig = QueryConfig<FetchEnsAvatarResult, Error>;

export const queryKey = ({
  address,
  chainId,
}: {
  address?: UseEnsAvatarArgs['address']
  chainId?: number
}) => [{ entity: 'ensAvatar', address, chainId }] as const;

const queryFn = ({
  queryKey: [{ address, chainId }],
}: QueryFunctionArgs<typeof queryKey>) => {
  if (!address)
    throw new Error('address is required');
  return fetchEnsAvatar({ address, chainId });
};

export function useEnsAvatar({
  address,
  cacheTime,
  chainId: chainId_,
  enabled = true,
  staleTime = 1_000 * 60 * 60 * 24, // 24 hours
  suspense,
  onError,
  onSettled,
  onSuccess,
}: SetMaybeRef<UseEnsAvatarArgs & UseEnsLookupConfig> = {}) {
  const chainId = useChainId({ chainId: chainId_ });

  const options = reactive({
    queryKey: computed(() => queryKey({ chainId: getMaybeRefValue(chainId), address: getMaybeRefValue(address) })),
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

import { useQueryClient } from 'vue-query';
import type {
  FetchBlockNumberArgs,
  FetchBlockNumberResult,
} from '@wagmi/core';
import {
  fetchBlockNumber,
} from '@wagmi/core';

import { computed, reactive, watchEffect } from 'vue';
import { useQuery } from '../utils/useQuery';
import type { QueryConfig, QueryFunctionArgs, SetMaybeRef } from '../../types';
import { useProvider, useWebSocketProvider } from '../providers';
import { useChainId } from '../utils';
import { getMaybeRefValue } from '../../utils';

type UseBlockNumberArgs = Partial<FetchBlockNumberArgs> & {
  /** Subscribe to changes */
  watch?: boolean
};

export type UseBlockNumberConfig = QueryConfig<FetchBlockNumberResult, Error>;

export function queryKey({ chainId }: { chainId?: number }) {
  return [{ entity: 'blockNumber', chainId }] as const;
}

function queryFn({
  queryKey: [{ chainId }],
}: QueryFunctionArgs<typeof queryKey>) {
  return fetchBlockNumber({ chainId });
}

export function useBlockNumber({
  cacheTime = 0,
  chainId: chainId_,
  enabled = true,
  staleTime,
  suspense,
  watch = false,
  onError,
  onSettled,
  onSuccess,
}: SetMaybeRef<UseBlockNumberArgs & UseBlockNumberConfig> = {}) {
  const chainId = useChainId({ chainId: chainId_ });
  const provider = useProvider();
  const webSocketProvider = useWebSocketProvider();
  const queryClient = useQueryClient();

  const listener = (blockNumber: number) => {
    // Just to be safe in case the provider implementation
    // calls the event callback after .off() has been called
    queryClient.setQueryData(queryKey({ chainId: getMaybeRefValue(chainId) }), blockNumber);
  };

  const provider_ = computed(() => webSocketProvider.value ?? provider.value);

  watchEffect((onInvalidate) => {
    if (!getMaybeRefValue(watch))
      return;

    provider_.value.on('block', listener);

    onInvalidate(() => {
      provider_.value.off('block', listener);
    });
  });

  const options = reactive({
    queryKey: computed(() => queryKey({ chainId: getMaybeRefValue(chainId) })),
    queryFn,
    cacheTime,
    enabled,
    staleTime,
    suspense,
    onError,
    onSettled,
    onSuccess,
  });

  return useQuery(options);
}

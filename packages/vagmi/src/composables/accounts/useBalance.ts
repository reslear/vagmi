import type { FetchBalanceArgs, FetchBalanceResult } from '@wagmi/core';
import { fetchBalance } from '@wagmi/core';
import { computed, reactive, watch } from 'vue';
import { useChainId, useQuery } from '../utils';

import type { QueryConfig, QueryFunctionArgs, SetMaybeRef } from '../../types';
import { getMaybeRefValue } from '../../utils';
import { useBlockNumber } from '../network-status';

export type UseBalanceArgs = Partial<FetchBalanceArgs> & {
  /** Subscribe to changes */
  watch?: boolean
};

export type UseBalanceConfig = QueryConfig<FetchBalanceResult, Error>;

export const queryKey = ({
  address,
  chainId,
  formatUnits,
  token,
}: Partial<FetchBalanceArgs> & {
  chainId?: number
}) =>
  [{ entity: 'balance', address, chainId, formatUnits, token }] as const;

const queryFn = ({
  queryKey: [{ address, chainId, formatUnits, token }],
}: QueryFunctionArgs<typeof queryKey>) => {
  if (!address)
    throw new Error('address is required');
  return fetchBalance({ address, chainId, formatUnits, token });
};

export function useBalance({
  address,
  cacheTime,
  chainId: chainId_,
  enabled = true,
  formatUnits = 'ether',
  staleTime,
  suspense,
  token,
  watch: watch_,
  onError,
  onSettled,
  onSuccess,
}: SetMaybeRef<UseBalanceArgs & UseBalanceConfig> = {}) {
  const chainId = useChainId({ chainId: chainId_ });
  const options = reactive({
    queryKey: computed(() => queryKey({
      address: getMaybeRefValue(address),
      chainId: getMaybeRefValue(chainId),
      formatUnits: getMaybeRefValue(formatUnits),
      token: getMaybeRefValue(token),
    })),
    queryFn,
    cacheTime,
    enabled: computed(() => Boolean(getMaybeRefValue(enabled) && getMaybeRefValue(address))),
    staleTime,
    suspense,
    onError,
    onSettled,
    onSuccess,
  });
  const balanceQuery = useQuery(options);

  const { data: blockNumber } = useBlockNumber({ watch: watch_ });

  watch(blockNumber, () => {
    if (!getMaybeRefValue(enabled))
      return;
    if (!getMaybeRefValue(watch))
      return;
    if (!getMaybeRefValue(blockNumber))
      return;
    if (!getMaybeRefValue(address))
      return;

    balanceQuery.refetch();
  }, {
    immediate: true,
  });

  return balanceQuery;
}

// @ts-nocheck
import { get } from '@vueuse/core';
import type {
  WaitForTransactionArgs,
  WaitForTransactionResult,
} from '@wagmi/core';
import {
  waitForTransaction,
} from '@wagmi/core';

import type { QueryConfig, QueryFunctionArgs } from '../../types';
import { useChainId, useQuery } from '../utils';

export type UseWaitForTransactionArgs = Partial<WaitForTransactionArgs>;

export type UseWaitForTransactionConfig = QueryConfig<
    WaitForTransactionResult,
    Error
  >;

type Hash = `0x${string}`;

export const queryKey = ({
  confirmations,
  chainId,
  hash,
  timeout,
}: Partial<WaitForTransactionArgs>) =>
  [
    {
      entity: 'waitForTransaction',
      confirmations,
      chainId,
      hash,
      timeout,
    },
  ] as const;

const queryFn = ({
  queryKey: [{ chainId, confirmations, hash, timeout }],
}: QueryFunctionArgs<typeof queryKey>) => {
  return waitForTransaction({ chainId, confirmations, hash, timeout});
};

export function useWaitForTransaction({
  chainId: chainId_,
  confirmations,
  hash,
  timeout,
  cacheTime,
  enabled = true,
  staleTime,
  suspense,
  onError,
  onSettled,
  onSuccess,
}: UseWaitForTransactionArgs & UseWaitForTransactionConfig = {}) {
  const chainId = useChainId({ chainId: chainId_ });

  return useQuery(
    queryKey({ chainId: get(chainId), confirmations, hash, timeout }),
    queryFn,
    {
      cacheTime,
      enabled: Boolean(enabled && (hash)),
      staleTime,
      suspense,
      onError,
      onSettled,
      onSuccess,
    },
  );
}

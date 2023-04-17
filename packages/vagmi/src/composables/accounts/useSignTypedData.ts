import type {
  SignTypedDataArgs,
  SignTypedDataResult,
} from '@wagmi/core';
import {
  signTypedData,
} from '@wagmi/core';
import { computed, reactive } from 'vue';
import { useMutation } from 'vue-query';

import type { MutationConfig, SetMaybeRef } from '../../types';
import { getMaybeRefValue } from '../../utils';

export type UseSignTypedDataArgs = Partial<SignTypedDataArgs>;

export type UseSignTypedDataConfig = MutationConfig<
  SignTypedDataResult,
  Error,
  SignTypedDataArgs
>;

export function mutationKey(args: UseSignTypedDataArgs) {
  return [
    { entity: 'signTypedData', ...args },
  ];
}

function mutationFn(args: UseSignTypedDataArgs) {
  const { domain, types, value } = args;
  if (!domain || !types || !value)
    throw new Error('domain, types, and value are all required');
  return signTypedData({ domain, types, value });
}

export function useSignTypedData({
  domain,
  types,
  value,
  onError,
  onMutate,
  onSettled,
  onSuccess,
}: SetMaybeRef<UseSignTypedDataArgs> & UseSignTypedDataConfig = {}) {
  const options = reactive({
    mutationKey: computed(() => mutationKey({
      domain: getMaybeRefValue(domain),
      types: getMaybeRefValue(types),
      value: getMaybeRefValue(value),
    })),
    mutationFn,
    onError,
    onMutate,
    onSettled,
    onSuccess,
  });

  const {
    data,
    error,
    isError,
    isIdle,
    isLoading,
    isSuccess,
    mutate,
    mutateAsync,
    reset,
    status,
    variables,
  } = useMutation(options);

  const signTypedData = (args?: SignTypedDataArgs) =>
    mutate(args || <SignTypedDataArgs>{ domain, types, value });

  const signTypedDataAsync = (args?: SignTypedDataArgs) =>
    mutateAsync(args || <SignTypedDataArgs>{ domain, types, value });

  return {
    data,
    error,
    isError,
    isIdle,
    isLoading,
    isSuccess,
    reset,
    signTypedData,
    signTypedDataAsync,
    status,
    variables,
  };
}

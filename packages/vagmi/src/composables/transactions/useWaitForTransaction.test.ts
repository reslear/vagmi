import { actConnect, renderComposable } from '../../../test';
import { useConnect } from '../accounts';
import type {
  UseWaitForTransactionArgs,
  UseWaitForTransactionConfig,
} from './useWaitForTransaction';
import {
  useWaitForTransaction,
} from './useWaitForTransaction';

function useWaitForTransactionWithConnect(
  config: UseWaitForTransactionArgs & UseWaitForTransactionConfig = {},
) {
  return {
    connect: useConnect(),
    waitForTransaction: useWaitForTransaction(config),
  };
}

describe('useWaitForTransaction', () => {
  it('mounts', () => {
    const { result } = renderComposable(() => useWaitForTransaction());
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { internal, ...res } = result;
    expect(res).toMatchInlineSnapshot(`
      {
        "data": undefined,
        "error": null,
        "fetchStatus": "idle",
        "isError": false,
        "isFetched": false,
        "isFetchedAfterMount": false,
        "isFetching": false,
        "isIdle": true,
        "isLoading": false,
        "isRefetching": false,
        "isSuccess": false,
        "refetch": [Function],
        "status": "idle",
      }
    `);
  });

  describe('configuration', () => {
    it('chainId,', async () => {
      const hash = '0x6825f7848a2d92e2788cb660ef57d22add152c8c70817c6a62ed58d97bead7c9';
      const utils = renderComposable(() =>
        useWaitForTransactionWithConnect({
          chainId: 1,
          hash,
        }),
      );
      const { nextTick, result, waitFor } = utils;
      await actConnect({ utils });

      nextTick();

      await waitFor(() =>
        expect(result.waitForTransaction.isSuccess).toBeTruthy(),
      );

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { data, internal, ...res } = result.waitForTransaction;
      expect(data).toBeDefined();
      expect(data.value?.transactionHash).toEqual(hash);
      expect(res).toMatchInlineSnapshot(`
        {
          "error": null,
          "fetchStatus": "idle",
          "isError": false,
          "isFetched": true,
          "isFetchedAfterMount": true,
          "isFetching": false,
          "isIdle": false,
          "isLoading": false,
          "isRefetching": false,
          "isSuccess": true,
          "refetch": [Function],
          "status": "success",
        }
      `);
    });

    it('hash', async () => {
      const hash = '0x6825f7848a2d92e2788cb660ef57d22add152c8c70817c6a62ed58d97bead7c9';
      const utils = renderComposable(() =>
        useWaitForTransactionWithConnect({
          hash,
        }),
      );

      const { nextTick, result, waitFor } = utils;

      await actConnect({ utils });

      nextTick();

      await waitFor(() =>
        expect(result.waitForTransaction.isSuccess).toBeTruthy(),
      );

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { data, internal, ...res } = result.waitForTransaction;
      expect(data).toBeDefined();
      expect(data.value?.transactionHash).toEqual(hash);
      expect(res).toMatchInlineSnapshot(`
        {
          "data": undefined,
          "error": [Error: missing revert data in call exception; Transaction reverted without a reason string [ See: https://links.ethers.org/v5-errors-CALL_EXCEPTION ] (data="0x", transaction={"from":"0xA0Cf798816D4b9b9866b5330EEa46a18382f251e","to":"0x283Af0B28c62C092C9727F1Ee09c02CA627EB7F5","type":0,"accessList":null}, error={"reason":"processing response error","code":"SERVER_ERROR","body":"{\\"jsonrpc\\":\\"2.0\\",\\"id\\":46,\\"error\\":{\\"code\\":-32603,\\"message\\":\\"Fork Error: JsonRpcClientError(JsonRpcError(JsonRpcError { code: -32000, message: \\\\\\"execution reverted\\\\\\", data: None }))\\"}}","error":{"code":-32603},"requestBody":"{\\"method\\":\\"eth_call\\",\\"params\\":[{\\"type\\":\\"0x0\\",\\"from\\":\\"0xa0cf798816d4b9b9866b5330eea46a18382f251e\\",\\"to\\":\\"0x283af0b28c62c092c9727f1ee09c02ca627eb7f5\\"},\\"0xbeea0b\\"],\\"id\\":46,\\"jsonrpc\\":\\"2.0\\"}","requestMethod":"POST","url":"http://127.0.0.1:8545"}, code=CALL_EXCEPTION, version=providers/5.7.2)],
          "fetchStatus": "idle",
          "isError": true,
          "isFetched": true,
          "isFetchedAfterMount": true,
          "isFetching": false,
          "isIdle": false,
          "isLoading": false,
          "isRefetching": false,
          "isSuccess": false,
          "refetch": [Function],
          "status": "error",
        }
      `);
    });
  });
});

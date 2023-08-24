export const SupportedChainId = {
  BSC: 56,
  BSC_TEST: 97,
  MEMO:985,
  MEMO_TEST:1985,
  DEVMEMO:2985
};

export const DefaultChainId = SupportedChainId.MEMO;

export const CHAIN_IDS_TO_NAMES = {
  [SupportedChainId.MEMO]: 'Memo DEVNet',
  [SupportedChainId.MEMO_TEST]: 'Memo MainNet'
};
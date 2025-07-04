// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.22;

import { MyNativeOFTAdapter } from "../MyNativeOFTAdapter.sol";

// @dev WARNING: This is for testing purposes only
contract MyNativeOFTAdapterMock is MyNativeOFTAdapter {
    constructor(
        uint8 _localDecimals,
        address _lzEndpoint,
        address _delegate
    ) MyNativeOFTAdapter(_localDecimals, _lzEndpoint, _delegate, true) {}
}

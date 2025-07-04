// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.22;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { NativeOFTAdapter } from "@layerzerolabs/oft-evm/contracts/NativeOFTAdapter.sol";

contract NativeOFTAdapterMock is NativeOFTAdapter {
    constructor(
        uint8 _localDecimals,
        address _lzEndpoint,
        address _delegate
    ) NativeOFTAdapter(_localDecimals, _lzEndpoint, _delegate) Ownable(_delegate) {}

    // @dev expose internal functions for testing purposes
    function debit(
        uint256 _amountToSendLD,
        uint256 _minAmountToCreditLD,
        uint32 _dstEid
    ) public returns (uint256 amountDebitedLD, uint256 amountToCreditLD) {
        return _debit(msg.sender, _amountToSendLD, _minAmountToCreditLD, _dstEid);
    }

    function credit(address _to, uint256 _amountToCreditLD, uint32 _srcEid) public returns (uint256 amountReceivedLD) {
        return _credit(_to, _amountToCreditLD, _srcEid);
    }
}

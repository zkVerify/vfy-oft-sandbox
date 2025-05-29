// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.22;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { NativeOFTAdapter } from "@layerzerolabs/oft-evm/contracts/NativeOFTAdapter.sol";

/**
 * @title NativeOFTAdapter
 * @dev NativeOFTAdapter is a contract that adapts native currency to the OFT functionality.
 *
 * @dev WARNING: ONLY 1 of these should exist for a given global mesh,
 * unless you make a NON-default implementation of OFT and needs to be done very carefully.
 * @dev WARNING: The default NativeOFTAdapter implementation assumes LOSSLESS transfers, ie. 1 native in, 1 native out.
 */
contract MyNativeOFTAdapter is NativeOFTAdapter {
    bool private checkForSlippage;

    constructor(
        uint8 _localDecimals,
        address _lzEndpoint,
        address _delegate,
        bool _checkForSlippage
    ) NativeOFTAdapter(_localDecimals, _lzEndpoint, _delegate) Ownable(_delegate) {
        checkForSlippage = _checkForSlippage;
    }

    //override to add check slippage switch (for tests)
    function _debitView(
        uint256 _amountLD,
        uint256 _minAmountLD,
        uint32 /*_dstEid*/
    ) internal view override virtual returns (uint256 amountSentLD, uint256 amountReceivedLD) {
        // @dev Remove the dust so nothing is lost on the conversion between chains with different decimals for the token.
        amountSentLD = _removeDust(_amountLD);
        // @dev The amount to send is the same as amount received in the default implementation.
        amountReceivedLD = amountSentLD;

        // @dev Check for slippage.
        if (checkForSlippage && amountReceivedLD < _minAmountLD) {
            revert SlippageExceeded(amountReceivedLD, _minAmountLD);
        }
    }
    
    function removeDust(uint256 _amountLD) public view returns (uint256 amountLD) {
        return _removeDust(_amountLD);
    }
}

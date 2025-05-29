// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.22;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { OFT } from "@layerzerolabs/oft-evm/contracts/OFT.sol";

contract MyOFT is OFT {
    bool private checkForSlippage;

    constructor(
        string memory _name,
        string memory _symbol,
        address _lzEndpoint,
        address _delegate,
        bool _checkForSlippage
    ) OFT(_name, _symbol, _lzEndpoint, _delegate) Ownable(_delegate) {
        checkForSlippage = _checkForSlippage;
    }

    //override to add check slippage switch (for tests)
    //if further tests on definitive networks make not fail with checkForSlippage=true, this method can be removed
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
}

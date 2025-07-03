import { Options } from "@layerzerolabs/lz-v2-utilities";
import hre from "hardhat";
import { expect } from 'chai'

const wait = (ms: number) => new Promise(res => setTimeout(res, ms));

async function getOftBalanceOnSecondNetwork(addr: string): Promise<number> {
  const secondChain = new hre.ethers.providers.JsonRpcProvider(process.env.OTHER_CHAIN_RPC);
  const secondWallet = new hre.ethers.Wallet(process.env.OTHER_CHAIN_PRIVATE_KEY, secondChain);

  const OFT = await hre.ethers.getContractFactory("MyOFT");
  const oft = await OFT.attach(process.env.OTHER_ADDRESS);

  return await oft.connect(secondWallet).balanceOf(addr);
}

async function runTests()  {
  
    const amountToSend = hre.ethers.utils.parseEther(process.env.TEST_VALUE)
    const signer = (await hre.ethers.getSigners())[0]
    
    //get balance before
    const oftBalanceBefore = await getOftBalanceOnSecondNetwork(signer.address);
    console.log(`oft balance on second chain is ${oftBalanceBefore}`)

    //get contract on first (native) chain
    const NativeOFTAdapter = await hre.ethers.getContractFactory("MyNativeOFTAdapter");
    const nativeOft = await NativeOFTAdapter.attach(process.env.NATIVE_ADDRESS)

    console.log(`Using contract: "MyNativeOFTAdapter", network: ${hre.network.name}, address: ${nativeOft.address}`)
    
    //sending value from native to oft
    console.log(`sending value ${amountToSend} from native to oft`)
    // Defining extra message execution options for the send operation
    const options = Options.newOptions().addExecutorLzReceiveOption(200000, 0).toHex().toString()

    const sendParam = [
        process.env.OTHER_CHAIN_EID!,
        hre.ethers.utils.zeroPad(signer.address, 32),
        amountToSend,
        amountToSend,
        options,
        '0x',
        '0x',
    ]

    // Fetching the native fee for the token send operation
    let [nativeFee] = await nativeOft.connect(signer).quoteSend(sendParam, false)
    const msgValue = nativeFee.add(amountToSend)

    // Executing the send operation from myNativeOFTAdapter contract
    let tx = await nativeOft
      .connect(signer)
      .send(sendParam, [nativeFee, 0], signer.address, { value: msgValue })

    console.log(`tx id: ${tx.hash}`)
    
    //wait
    console.log(`waiting 2 minutes for LayerZero to complete the flow`)
    await wait(120000);
    
    //get balance after
    const oftBalanceAfter = await getOftBalanceOnSecondNetwork(signer.address);
    console.log(`oft balance on second chain now is ${oftBalanceAfter}`)

    //assert
    const diff = oftBalanceAfter - oftBalanceBefore;
    expect(diff.toString()).eql(amountToSend.toString());

    console.log(`test passed`);
  }

runTests()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

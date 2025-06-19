import { Options } from "@layerzerolabs/lz-v2-utilities";
import { Contract, Transaction, Wallet } from "ethers";
import hre from "hardhat";

async function runTests()  {
  
    const amountToSend = hre.ethers.utils.parseEther(process.env.TEST_VALUE)
    const signer = (await hre.ethers.getSigners())[0]

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
  }

runTests()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

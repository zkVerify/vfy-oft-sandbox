import { Options } from "@layerzerolabs/lz-v2-utilities";
import { Contract, Transaction, Wallet } from "ethers";
import hre from "hardhat";

async function runTests()  {
  
    const amountToSend = hre.ethers.utils.parseEther(process.env.TEST_VALUE)
    const secondChain = new hre.ethers.providers.JsonRpcProvider(process.env.OTHER_CHAIN_RPC);
    const signer = new hre.ethers.Wallet(process.env.OTHER_CHAIN_PRIVATE_KEY, secondChain);

    //get contract on second chain
    const OFT = await hre.ethers.getContractFactory("MyOFT");
    const oft = await OFT.attach(process.env.OTHER_ADDRESS)

    console.log(`Using contract: "MyOFT", network: ${process.env.OTHER_CHAIN_RPC}, address: ${oft.address}`)

    console.log(`sending value ${amountToSend} from oft to native`)
    // Defining extra message execution options for the send operation
    const options = Options.newOptions().addExecutorLzReceiveOption(200000, 0).toHex().toString()

    const sendParam = [
        process.env.FIRST_CHAIN_EID,
        hre.ethers.utils.zeroPad(signer.address, 32),
        amountToSend,
        amountToSend,
        options,
        '0x',
        '0x',
    ]

    // Fetching the native fee for the token send operation
    let [nativeFee] = await oft.connect(signer).quoteSend(sendParam, false)
    // Executing the send operation from myNativeOFTAdapter contract
    let tx =  await oft
      .connect(signer)
      .send(sendParam, [nativeFee, 0], signer.address, { value: nativeFee })
      console.log(`tx id: ${tx.hash}`)
  }

runTests()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

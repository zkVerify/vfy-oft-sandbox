import hre from "hardhat";


async function deployAndSetup()  {

  const deployer = (await hre.ethers.getSigners())[0]

  console.log(`First Network: ${hre.network.name}`)
  console.log(`Deployer: ${deployer.address}`)

  //deploy on first
  const NativeOFTAdapter = await hre.ethers.getContractFactory("MyNativeOFTAdapter");
  const nativeOft = await NativeOFTAdapter.deploy(18, process.env.FIRST_CHAIN_ENDPOINT, deployer.address, false)

  console.log(`Deployed contract: "MyNativeOFTAdapter", network: ${hre.network.name}, address: ${nativeOft.address}`)

  //deploy on second
  const secondChain = new hre.ethers.providers.JsonRpcProvider(process.env.OTHER_CHAIN_RPC);
  const secondDeployer = new hre.ethers.Wallet(process.env.OTHER_CHAIN_PRIVATE_KEY, secondChain);

  console.log(`Second Network RPC: ${process.env.OTHER_CHAIN_RPC}`)
  console.log(`Deployer: ${secondDeployer.address}`)

  const OFT = await hre.ethers.getContractFactory("MyOFT");
  const oft = await OFT.connect(secondDeployer).deploy(process.env.OFT_NAME, process.env.OFT_SYMBOL, process.env.OTHER_CHAIN_ENDPOINT, secondDeployer.address, false);

  console.log(`Deployed contract: "MyOFT", network: ${process.env.OTHER_CHAIN_RPC}, address: ${oft.address}`)
  
  //set peers on first
  let tx1 = await nativeOft.connect(deployer).setPeer(process.env.OTHER_CHAIN_EID, hre.ethers.utils.zeroPad(oft.address, 32))
  console.log(`setup tx on first chain: ${tx1.hash}`)

  //set peers on second
  let tx2 = await oft.connect(secondDeployer).setPeer(process.env.FIRST_CHAIN_EID, hre.ethers.utils.zeroPad(nativeOft.address, 32))
  console.log(`setup tx on second chain: ${tx2.hash}`)
}

deployAndSetup()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

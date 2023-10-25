import hre, { ethers } from "hardhat";
import abi from "./abiGmx.json";
import abirouter from "./abirouter.json";
import erc20 from "./erc20.json";
import reader from "./Reader.json";
import orderBook from "./OrderBook.json"
import { Address } from "web3";
import { HardhatEthersProvider } from "@nomicfoundation/hardhat-ethers/internal/hardhat-ethers-provider";
import { JsonRpcProvider } from "ethers";
describe("Lock", function () {
  const GMX_POSITION_ROUTER = "0xb87a436B93fFE9D75c5cFA7bAcFff96430b09868";
  const USDC_ADDRESS = "0xaf88d065e77c8cC2239327C5EDb3A432268e5831";
  const USDC_WHALE = "0xE68Ee8A12c611fd043fB05d65E1548dC1383f2b9";
  const INDEX_TOKEN = "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1";
  const GMX_ROUTER = "0xaBBc5F99639c9B6bCb58544ddf04EFA6802F4064";
  const READER_VALUT = "0x22199a49A999c351eF7927602CFB187ec3cae489";
  const VAULT = "0x489ee077994B6658eAfA855C308275EAd8097C4A";
  const ORDER_BOOK = "0x09f77E8A13De9a35a7231028187e9fD5DB8a2ACB"
  let GMX_POSITION_ROUTER_CONTRACT: any;
  let GMX_ROUTER_CONTRACT: any;
  let USDC_CONTRACT: any;
  let READER_CONTRACT: any;
  let signer: any;
  let fee: any;
  let ORDER_BOOK_CONTRACT:any
  let GMX_SM_ACCOUNT: any;
  async function deployOneYearLockFixture(signer: any) {
    const Account = await ethers.getContractFactory("Account", signer);
    const Account_Contract = await Account.deploy(
      USDC_ADDRESS,
      GMX_POSITION_ROUTER,
      GMX_ROUTER
    );
    return Account_Contract;
  }
  before(async () => {
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545/");
    signer = await ethers.getImpersonatedSigner(USDC_WHALE);
    GMX_SM_ACCOUNT = await deployOneYearLockFixture(signer);
    GMX_POSITION_ROUTER_CONTRACT = new ethers.Contract(
      GMX_POSITION_ROUTER,
      abi.abi,
      provider
    );
    GMX_ROUTER_CONTRACT = new ethers.Contract(
      GMX_ROUTER,
      abirouter.abi,
      provider
    );
    USDC_CONTRACT = new ethers.Contract(USDC_ADDRESS, erc20.abi, provider);
    READER_CONTRACT = new ethers.Contract(READER_VALUT, reader.abi, provider);
    ORDER_BOOK_CONTRACT = new ethers.Contract(ORDER_BOOK, orderBook.abi, provider);
    hre.tracer.nameTags[GMX_POSITION_ROUTER] = "GMX_POSITION_ROUTER";
    hre.tracer.nameTags["0xE68Ee8A12c611fd043fB05d65E1548dC1383f2b9"] = "SINGER";
    hre.tracer.nameTags[GMX_ROUTER] = "ROUTERGMX";
    hre.tracer.nameTags[USDC_CONTRACT] = "USDCCONTRACT";
    hre.tracer.nameTags[READER_VALUT] = "READERVALUT";
    hre.tracer.nameTags[VAULT] = "VAULT";
    hre.tracer.nameTags[GMX_SM_ACCOUNT.target] = "SMART MARGIN";
  });

  describe("Events", function () {
    it("approve router plugin", async () => {
      await GMX_SM_ACCOUNT.connect(signer).approvePlugin();
    });
    it("approve USDC", async () => {
      // await USDC_CONTRACT.connect(signer).approve(GMX_POSITION_ROUTER_CONTRACT,ethers.parseEther("30000000000"))
      await USDC_CONTRACT.connect(signer).approve(
        GMX_SM_ACCOUNT.target,
        ethers.parseEther("30000000000")
      );
    });
    it("approve USDC", async () => {
      // await USDC_CONTRACT.connect(signer).approve(GMX_POSITION_ROUTER_CONTRACT,ethers.parseEther("30000000000"))
      await USDC_CONTRACT.connect(signer).approve(
        GMX_ROUTER,
        ethers.parseEther("30000000000")
      );
    });
    // it("approve USDC", async () => {
    //   // await USDC_CONTRACT.connect(signer).approve(GMX_POSITION_ROUTER_CONTRACT,ethers.parseEther("30000000000"))
    //   await USDC_CONTRACT.connect(signer).approve(
    //     USDC_ADDRESS,
    //     ethers.parseEther("30000000000")
    //   );
    // });
    it("get minExecutionFee ", async () => {
      fee = await GMX_POSITION_ROUTER_CONTRACT.minExecutionFee();
      console.log("fee", fee.toString());
    });
    it("Deposit USD ", async () => {
     await GMX_SM_ACCOUNT.connect(signer).Deposit("1000000000");
    
    });
    it("Deposit USD ", async () => {
    const data =   await USDC_CONTRACT.balanceOf(GMX_SM_ACCOUNT.target)
    console.log("data",data)
     
     });
     
    it("create a position on GMX", async function () {
      // console.log(await GMX_POSITION_ROUTER_CONTRACT)
      // const data = await  GMX_POSITION_ROUTER_CONTRACT.vault()
      // console.log(data)]
console.log(fee.toString())

      await GMX_SM_ACCOUNT.connect(signer).createPosition(
        [USDC_ADDRESS],
        INDEX_TOKEN,
        "1000000000",
        "0",
        "10778171088427860695819480000000000",
        true,
        "1540316010000000000000000000000000",
        fee.toString(),
        "0x0000000000000000000000000000000000000000000000000000000000000000",
        { value: fee.toString() }
      );
    });
    it("get Position", async () => {
      let  position = await READER_CONTRACT.getPositions(
        VAULT,
        GMX_SM_ACCOUNT.target,
        [USDC_ADDRESS],
        [INDEX_TOKEN],
        [true]
      );
      console.log(position);
      const index = await ORDER_BOOK_CONTRACT.increaseOrdersIndex(GMX_SM_ACCOUNT.target)
      console.log(index.toString())
       position = await ORDER_BOOK_CONTRACT.getIncreaseOrder(
         GMX_SM_ACCOUNT.target,
         index.toString()
      );
      console.log(position);
    });
  });
});

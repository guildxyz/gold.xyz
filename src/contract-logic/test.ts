import { Keypair, PublicKey, Transaction } from "@solana/web3.js"
import { CONNECTION, CONTRACT_ADMIN_KEYPAIR } from "./consts"
import { initContract } from "./transactions/initializeContract"

export async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export class MasterNftData {
  name: string = "TEST"
  symbol: string = "TST"
  uri: string = "test.com"
}

export const SECRET2 = Uint8Array.from([
  110, 156, 29, 116, 136, 221, 72, 113, 16, 84, 50, 192, 65, 209, 100, 231, 3, 47, 231, 28, 161, 218, 169, 110, 250,
  194, 114, 27, 94, 114, 59, 109, 120, 10, 72, 77, 1, 26, 130, 146, 19, 164, 30, 88, 232, 81, 31, 206, 127, 186, 90,
  180, 126, 86, 40, 54, 128, 75, 248, 85, 2, 128, 84, 202,
])

export const SECRET3 = Uint8Array.from([
  149, 210, 118, 216, 144, 222, 57, 30, 7, 228, 175, 91, 120, 94, 197, 122, 199, 108, 28, 160, 229, 17, 63, 226, 180,
  142, 38, 28, 233, 201, 69, 130, 45, 115, 172, 64, 253, 227, 246, 254, 233, 174, 56, 153, 112, 50, 17, 252, 140, 177,
  128, 180, 121, 240, 113, 21, 64, 141, 111, 221, 31, 93, 6, 156,
])

export async function sendTransaction(transaction: Transaction, signer: Keypair) {
  await CONNECTION.confirmTransaction(
    await CONNECTION.sendTransaction(transaction, [signer], {
      skipPreflight: false,
      preflightCommitment: "singleGossip",
    })
  )
}

export async function init(auctionOwnerPubkey: PublicKey) {
  await CONNECTION.confirmTransaction(await CONNECTION.requestAirdrop(CONTRACT_ADMIN_KEYPAIR.publicKey, 100000000))

  try {
    await initContract(CONTRACT_ADMIN_KEYPAIR)
    console.log("successfully initialized contract")
  } catch (e) {
    console.log("contract already initialized")
  }

  var waitTill = new Date(new Date().getTime() + 10 * 1000)
  while (waitTill > new Date()) {}

  await CONNECTION.confirmTransaction(await CONNECTION.requestAirdrop(auctionOwnerPubkey, 100000000))
  console.log("successfully initialized payers")
}

// TODO remove these
/*
async function test_all_ix(contractAdmin: Keypair, auctionOwner: Keypair, user1: Keypair, auctionId: Uint8Array){
	const nft = new MasterNftData();
	// This is here to enable multiple runs on a single test-validator restart.
	// TODO remove when possible
	//while(true){
	//	try{
	//		let auctionName = auctionId;
	//		await startAuction(contractAdmin.publicKey, auctionOwner, nft, auctionId, auctionName, 10, 100);
	//		console.log("Started auction with id: ");
	//		console.log(auctionId);
	//		break;
	//	} catch (error){
	//		console.log("Unable to initialize auction with id: ", auctionId);
	//		auctionId[0] += 1;
	//	}
	//}
	const metadata = await getMasterMetadata(auctionOwner.publicKey, auctionId);
	console.log("master metadata pubkey:");
	console.log(metadata);

	const auctions = await getAuctionPool();
	console.log("auctions:");
	console.log(auctions);

	const auction = await getAuctionWithId(auctionId);
	console.log("new auction pubkey:");
	console.log(new PublicKey(auction));
	const [auctionRootStatePubkey, _z] = await PublicKey.findProgramAddress([Buffer.from("auction_root_state"), Buffer.from(auctionId), Buffer.from(auctionOwner.publicKey.toBytes())], PROGRAM_ID);
	console.log(auctionRootStatePubkey);
	await bid(user1, auctionOwner.publicKey, auctionId, 10000);
	await bid(user1, auctionOwner.publicKey, auctionId, 100000);	
	console.log("Bids taken.");
	await sleep(10000);
	await closeCycle(auctionOwner.publicKey, user1, auctionId, 1);
	console.log("Cycle closed.");
	await claimFunds(contractAdmin, auctionOwner, auctionId, 10000);
	await claimFunds(contractAdmin, auctionOwner, auctionId, 90000);
	console.log("Funds claimed.");
	await freeze(auctionOwner, auctionId);
	console.log("Auction frozen.");
	
	console.log("First auction cycle:, ", await readNthCycleState(auctionOwner.publicKey, auctionId, 1));
	console.log("Second auction cycle:, ", await readNthCycleState(auctionOwner.publicKey, auctionId, 2));
	try{
		console.log("Third auction cycle:, ", await readNthCycleState(auctionOwner.publicKey, auctionId, 3));
	} catch(e) {
		console.log("Trying to read non-existant cycle state failed (expected)");
	}
}

async function test_nft_mints(contractAdmin: Keypair, auctionOwner: Keypair, user1: Keypair, auctionId: Uint8Array) {
	
	const masterMetadata = await getMasterMetadata(auctionOwner.publicKey, auctionId);
    const masterAccounts = await getMasterAccounts(auctionId, auctionOwner.publicKey);

	for(let i=1; i < 4; ++i){
		await bid(user1, auctionOwner.publicKey, auctionId, 10000);
		await sleep(3000);
		await closeCycle(auctionOwner.publicKey, user1, auctionId, i);

		let childAccounts = await getChildAccounts(auctionId, auctionOwner.publicKey, i);
		let holdingAccountInfo = await CONNECTION.getTokenAccountsByOwner(user1.publicKey, { mint: childAccounts.mint });
		let holdingAccount = holdingAccountInfo.value[0].pubkey;
		assert.deepEqual(holdingAccount, childAccounts.holding);
		assert.deepEqual(await (await CONNECTION.getTokenAccountBalance(holdingAccount)).value.uiAmount, 1);

		let child_metadata = await getChildMetadata(auctionOwner.publicKey, auctionId, i);
		assert.deepEqual(child_metadata, masterMetadata);

		let childEditionAccount = await CONNECTION.getAccountInfo(childAccounts.edition);
		let childEditionData: Buffer = childEditionAccount!.data;
		let childEdition = deserializeUnchecked(MetadataLayout.EDITION_SCHEMA, MetadataLayout.Edition, childEditionData);

		assert.deepEqual(new PublicKey(childEdition.parent), masterAccounts.edition);
		assert(childEdition.edition.eq(new BN(i)));
		
		console.log("Asserts of cycle", i, "successful");
	}
}
*/

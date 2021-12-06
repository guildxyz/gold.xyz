/* tslint:disable */
/* eslint-disable */
/**
* @param {Uint8Array} serialized_input
* @returns {string}
*/
export function initAuctionWasm(serialized_input: Uint8Array): string;
/**
* @param {Uint8Array} serialized_input
* @returns {string}
*/
export function freezeAuctionWasm(serialized_input: Uint8Array): string;
/**
* @param {Uint8Array} serialized_input
* @returns {string}
*/
export function placeBidWasm(serialized_input: Uint8Array): string;
/**
* @param {Uint8Array} serialized_input
* @returns {string}
*/
export function claimFundsWasm(serialized_input: Uint8Array): string;
/**
* @param {Uint8Array} serialized_input
* @returns {string}
*/
export function deleteAuctionWasm(serialized_input: Uint8Array): string;
/**
* @param {Uint8Array} serialized_input
* @returns {string}
*/
export function initContractWasm(serialized_input: Uint8Array): string;
/**
* @param {Uint8Array} admin_pubkey
* @returns {Uint8Array}
*/
export function getAuctionPoolPubkeyWasm(admin_pubkey: Uint8Array): Uint8Array;
/**
* @param {Uint8Array} auction_id
* @param {Uint8Array} owner_pubkey
* @returns {Uint8Array}
*/
export function getAuctionBankPubkeyWasm(auction_id: Uint8Array, owner_pubkey: Uint8Array): Uint8Array;
/**
* @param {Uint8Array} auction_id
* @param {Uint8Array} owner_pubkey
* @returns {Uint8Array}
*/
export function getRootStatePubkeyWasm(auction_id: Uint8Array, owner_pubkey: Uint8Array): Uint8Array;
/**
* @param {Uint8Array} root_state_pubkey
* @param {Uint8Array} cycle_number_bytes
* @returns {Uint8Array}
*/
export function getCycleStatePubkeyWasm(root_state_pubkey: Uint8Array, cycle_number_bytes: Uint8Array): Uint8Array;
/**
* @param {Uint8Array} auction_id
* @param {Uint8Array} owner_pubkey
* @returns {Uint8Array}
*/
export function getMasterMintPubkeyWasm(auction_id: Uint8Array, owner_pubkey: Uint8Array): Uint8Array;
/**
* @param {Uint8Array} mint_pubkey
* @returns {Uint8Array}
*/
export function getMasterMetadataPubkeyWasm(mint_pubkey: Uint8Array): Uint8Array;
/**
* @param {Uint8Array} auction_id
* @param {Uint8Array} owner_pubkey
* @returns {Uint8Array}
*/
export function getTokenMintPubkeyWasm(auction_id: Uint8Array, owner_pubkey: Uint8Array): Uint8Array;
/**
* @param {Uint8Array} mint_account_data
* @returns {number}
*/
export function getDecimalsFromMintAccountDataWasm(mint_account_data: Uint8Array): number;

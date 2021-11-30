/* tslint:disable */
/* eslint-disable */
/**
* @param {Uint8Array} serialized_input
* @returns {string}
*/
export function initAuction(serialized_input: Uint8Array): string;
/**
* @param {Uint8Array} serialized_input
* @returns {string}
*/
export function freezeAuction(serialized_input: Uint8Array): string;
/**
* @param {Uint8Array} serialized_input
* @returns {string}
*/
export function placeBid(serialized_input: Uint8Array): string;
/**
* @param {Uint8Array} serialized_input
* @returns {string}
*/
export function claimFunds(serialized_input: Uint8Array): string;
/**
* @param {Uint8Array} serialized_input
* @returns {string}
*/
export function deleteAuction(serialized_input: Uint8Array): string;
/**
* @param {Uint8Array} serialized_input
* @returns {string}
*/
export function initContract(serialized_input: Uint8Array): string;
/**
* @param {Uint8Array} admin_pubkey
* @returns {Uint8Array}
*/
export function getAuctionPoolPubkey(admin_pubkey: Uint8Array): Uint8Array;
/**
* @param {Uint8Array} auction_id
* @param {Uint8Array} owner_pubkey
* @returns {Uint8Array}
*/
export function getAuctionBankPubkey(auction_id: Uint8Array, owner_pubkey: Uint8Array): Uint8Array;
/**
* @param {Uint8Array} auction_id
* @param {Uint8Array} owner_pubkey
* @returns {Uint8Array}
*/
export function getRootStatePubkey(auction_id: Uint8Array, owner_pubkey: Uint8Array): Uint8Array;
/**
* @param {Uint8Array} root_state_pubkey
* @param {number} cycle_number
* @returns {Uint8Array}
*/
export function getCycleStatePubkey(root_state_pubkey: Uint8Array, cycle_number: number): Uint8Array;
/**
* @param {Uint8Array} auction_id
* @param {Uint8Array} owner_pubkey
* @returns {Uint8Array}
*/
export function getMasterMintPubkey(auction_id: Uint8Array, owner_pubkey: Uint8Array): Uint8Array;
/**
* @param {Uint8Array} mint_pubkey
* @returns {Uint8Array}
*/
export function getMasterMetadataPubkey(mint_pubkey: Uint8Array): Uint8Array;

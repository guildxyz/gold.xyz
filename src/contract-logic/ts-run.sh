cargo run --manifest-path ../../zgen-solana/zgsol-glue/Cargo.toml -- --wasm ../../zgen-solana/zgsol-fund-client --schema ../../zgen-solana/zgsol-fund-contract --standalone
rm -r ../../wasm-factory
mv ../../zgen-solana/zgsol-fund-client/wasm-factory ../../
cp contract-logic/schema.ts ./
rm -r contract-logic
ts-node index.ts

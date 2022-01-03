cargo run --manifest-path ../../zgen-solana/zgsol-glue/Cargo.toml -- --wasm ../../zgen-solana/zgsol-gold-client --schema ../../zgen-solana/zgsol-gold-contract --standalone
rm -r ../../wasm-factory
mv ../../zgen-solana/zgsol-gold-client/wasm-factory ../../
cp contract-logic/schema.ts ./
rm -r contract-logic
ts-node index.ts

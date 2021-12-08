cargo run --manifest-path ../../zgen-solana/zgsol-glue/Cargo.toml -- --wasm ../../zgen-solana/zgsol-fund-client --standalone
rm -r ../../wasm-factory
mv ../../zgen-solana/zgsol-fund-client/wasm-factory ../../
ts-node index.ts

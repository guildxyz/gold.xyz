cargo install agsol-glue

agsol-glue --wasm ../../rust/client --schema ../../rust/contract -o ../contract-logic

ts-node index.ts

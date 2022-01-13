const withTM = require("next-transpile-modules")([
  "@blocto/sdk",
  "@project-serum/sol-wallet-adapter",
  "@solana/wallet-adapter-base",
  "@solana/wallet-adapter-react",
  "@solana/wallet-adapter-phantom",
])

const WasmPackPlugin = require("@wasm-tool/wasm-pack-plugin")
const SSRPlugin =
  require("next/dist/build/webpack/plugins/nextjs-ssr-import").default
const { dirname, relative, resolve, join } = require("path")

/** @type {import("next").NextConfig} */
module.exports = withTM({
  webpack(config) {
    // From https://github.com/rustwasm/wasm-pack/issues/835#issuecomment-772591665
    config.experiments = {
      syncWebAssembly: true,
      topLevelAwait: true,
      layers: true,
    }

    config.module.rules.push({
      test: /\.wasm$/,
      type: "webassembly/sync",
    })

    if (!process.env.IS_VERCEL) {
      config.plugins.push(
        new WasmPackPlugin({
          crateDirectory: resolve("./rust/client"),
          args: "--log-level warn",
          outDir: "../../src/contract-logic/wasm-factory",
          outName: "instructions",
        })
      )
    }

    return config
  },
})

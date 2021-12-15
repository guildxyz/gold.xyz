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
          crateDirectory: resolve("./zgen-solana/zgsol-fund-client"),
          args: "--log-level warn",
          outDir: "../../wasm-factory",
          outName: "instructions",
        })
      )
    }

    // From https://github.com/vercel/next.js/issues/22581#issuecomment-864476385
    const ssrPlugin = config.plugins.find((plugin) => plugin instanceof SSRPlugin)

    if (ssrPlugin) {
      patchSsrPlugin(ssrPlugin)
    }

    return config
  },
})

// Patch the NextJsSSRImport plugin to not throw with WASM generated chunks.
function patchSsrPlugin(plugin) {
  plugin.apply = function apply(compiler) {
    compiler.hooks.compilation.tap("NextJsSSRImport", (compilation) => {
      compilation.mainTemplate.hooks.requireEnsure.tap(
        "NextJsSSRImport",
        (code, chunk) => {
          // The patch that we need to ensure this plugin doesn't throw
          // with WASM chunks.
          if (!chunk.name) {
            return
          }

          // Update to load chunks from our custom chunks directory
          const outputPath = resolve("/")
          const pagePath = join("/", dirname(chunk.name))
          const relativePathToBaseDir = relative(pagePath, outputPath)
          // Make sure even in windows, the path looks like in unix
          // Node.js require system will convert it accordingly
          const relativePathToBaseDirNormalized = relativePathToBaseDir.replace(
            /\\/g,
            "/"
          )
          return code
            .replace('require("./"', `require("${relativePathToBaseDirNormalized}/"`)
            .replace(
              "readFile(join(__dirname",
              `readFile(join(__dirname, "${relativePathToBaseDirNormalized}"`
            )
        }
      )
    })
  }
}

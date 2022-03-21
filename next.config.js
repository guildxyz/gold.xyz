const withTM = require("next-transpile-modules")([
  "@project-serum/sol-wallet-adapter",
  "@solana/wallet-adapter-base",
  "@solana/wallet-adapter-react",
  "@solana/wallet-adapter-phantom",
])

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

    return config
  },
  async rewrites() {
    return [
      {
        source: "/js/script.js",
        destination: "https://stat.zgen.hu/js/plausible.js",
      },
      {
        source: "/api/event",
        destination: "https://stat.zgen.hu/api/event",
      },
      {
        source: "/datadog-rum-v4.js",
        destination: "https://www.datadoghq-browser-agent.com/datadog-rum-v4.js",
      },
    ]
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

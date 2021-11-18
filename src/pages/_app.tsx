import Chakra from "components/_app/Chakra"
import "focus-visible/dist/focus-visible"
import type { AppProps } from "next/app"
import dynamic from "next/dynamic"
import { IconContext } from "phosphor-react"
import { SWRConfig } from "swr"
import fetcher from "utils/fetcher"

const WalletConnectionProvider = dynamic(
  () => import("components/_app/WalletConnectionProvider"),
  {
    ssr: false,
  }
)

function App({ Component, pageProps }: AppProps): JSX.Element {
  return (
    <Chakra cookies={pageProps.cookies}>
      <SWRConfig
        value={{
          onError: (e) => console.error(e),
          fetcher,
        }}
      >
        <IconContext.Provider
          value={{
            color: "currentColor",
            size: "1em",
            weight: "bold",
            mirrored: false,
          }}
        >
          <WalletConnectionProvider>
            <Component {...pageProps} />
          </WalletConnectionProvider>
        </IconContext.Provider>
      </SWRConfig>
    </Chakra>
  )
}

export default App

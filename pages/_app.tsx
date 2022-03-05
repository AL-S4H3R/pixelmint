import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { ChakraProvider } from '@chakra-ui/react'
import '@fontsource/press-start-2p'
import '@fontsource/rubik'
import '@fontsource/vt323'
import { theme } from '../theme'
import DAppProvider from '../src/providers/DAppProvider'
import { ExternalProvider, JsonRpcFetchFunc, Web3Provider } from '@ethersproject/providers'
import { Web3ReactProvider } from '@web3-react/core'

const getLibrary = (
  provider: ExternalProvider | JsonRpcFetchFunc
) => {
  return new Web3Provider(provider)
}

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider theme={theme}>
      <Web3ReactProvider getLibrary={getLibrary}>
        <DAppProvider>
          <Component {...pageProps} />
        </DAppProvider>
      </Web3ReactProvider>
    </ChakraProvider>
  )
}

export default MyApp

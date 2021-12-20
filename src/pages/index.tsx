import { Box, Button, Flex, Heading, Img, VStack } from "@chakra-ui/react"
import Head from "next/head"
import { TelegramLogo } from "phosphor-react"

const Page = (): JSX.Element => (
  <>
    <Head>
      <title>Gold.xyz</title>
      <meta property="og:title" content="Gold.xyz" />
    </Head>

    <Box minHeight="100vh">
      <Flex alignItems="center" justifyContent="center" h="80vh">
        <VStack spacing={8}>
          <Img boxSize={28} src="/logo.svg" />
          <Heading fontFamily="display">Coming soon!</Heading>
          <Button
            as="a"
            colorScheme="telegram"
            leftIcon={<TelegramLogo />}
            href="https://t.me/+QQOiku7n-K02Zjc0"
          >
            Join Telegram
          </Button>
        </VStack>
      </Flex>
    </Box>
  </>
)

export default Page

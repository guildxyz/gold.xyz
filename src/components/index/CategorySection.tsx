import { SimpleGrid, Spinner, Text } from "@chakra-ui/react"
import Section from "components/common/Section"
import { AnimatePresence, LayoutGroup } from "framer-motion"
import { PropsWithChildren } from "react"

type Props = {
  title: string | JSX.Element
  fallback: string | JSX.Element
  isLoading?: boolean
}

const CategorySection = ({
  title,
  fallback,
  isLoading,
  children,
}: PropsWithChildren<Props>): JSX.Element => {
  if (isLoading)
    return (
      <Section title={title}>
        <Text
          fontWeight="bold"
          colorScheme="gray"
          display="flex"
          alignItems="center"
          px={{ base: 5, sm: 7 }}
          py={6}
          border="2px"
          borderColor="transparent"
        >
          <Spinner mr={{ base: "5", sm: "10" }} />
          Loading
        </Text>
      </Section>
    )

  return (
    <Section title={title}>
      {children ? (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={{ base: 5, md: 6 }}>
          <LayoutGroup>
            <AnimatePresence>{children}</AnimatePresence>
          </LayoutGroup>
        </SimpleGrid>
      ) : (
        <Text>{fallback}</Text>
      )}
    </Section>
  )
}

export default CategorySection

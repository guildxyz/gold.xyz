import { SimpleGrid, Text } from "@chakra-ui/react"
import Section from "components/common/Section"
import { PropsWithChildren } from "react"

type Props = {
  title: string | JSX.Element
  fallbackText: string
}

const CategorySection = ({
  title,
  fallbackText,
  children,
}: PropsWithChildren<Props>): JSX.Element => (
  <Section title={title}>
    {children ? (
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={{ base: 5, md: 6 }}>
        {children}
      </SimpleGrid>
    ) : (
      <Text>{fallbackText}</Text>
    )}
  </Section>
)

export default CategorySection

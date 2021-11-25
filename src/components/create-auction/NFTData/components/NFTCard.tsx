import {
  Button,
  Center,
  HStack,
  IconButton,
  Image,
  Text,
  Tooltip,
  VStack,
} from "@chakra-ui/react"
import Card from "components/common/Card"
import { Plus, TrashSimple } from "phosphor-react"
import { useEffect } from "react"
import { useFieldArray, useWatch } from "react-hook-form"
import TraitInput from "./TraitInput"

type Props = {
  index: number
  removeNft: () => void
}

const NFTCard = ({ index, removeNft }: Props) => {
  const name = useWatch({ name: "nftData.name" })
  const preview = useWatch({ name: `nfts.${index}.preview` })
  const { fields, append, remove } = useFieldArray({ name: `nfts.${index}.traits` })

  const addTrait = () =>
    append({
      key: "",
      value: "",
    })

  useEffect(() => {
    if (fields.length <= 0) {
      addTrait()
      addTrait()
    }
  }, [])

  return (
    <Card>
      <Center bg="gray.900" h="180px">
        <Image src={preview} alt="Placeholder" height="100%" width="auto" />
      </Center>
      <VStack p="5" pt="3" spacing="3">
        <HStack width="full" justifyContent="space-between">
          <Text fontWeight="bold">
            {name} #{index}
          </Text>
          <Tooltip label="Remove NFT">
            <IconButton
              size="sm"
              variant="ghost"
              rounded="full"
              icon={<TrashSimple />}
              colorScheme="red"
              aria-label="Remove NFT"
              onClick={removeNft}
            />
          </Tooltip>
        </HStack>
        <VStack spacing="2">
          {fields.map((_field, traitIndex) => (
            <TraitInput
              key={traitIndex}
              nftIndex={index}
              traitIndex={traitIndex}
              unselectTrait={() => remove(traitIndex)}
            />
          ))}
        </VStack>
        <Button
          onClick={addTrait}
          width="full"
          size="sm"
          fontSize="xs"
          borderRadius="lg"
          leftIcon={<Plus />}
          aria-label="Add trait"
        >
          Add trait
        </Button>
      </VStack>
    </Card>
  )
}

export default NFTCard

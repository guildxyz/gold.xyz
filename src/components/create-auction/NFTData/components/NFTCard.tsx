import { HStack, IconButton, Image, Text, Tooltip, VStack } from "@chakra-ui/react"
import Card from "components/common/Card"
import { Plus, X } from "phosphor-react"
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
      <VStack p={5}>
        <HStack width="full" justifyContent="space-between">
          <Text>
            {name} #{index}
          </Text>
          <Tooltip label="Remove NFT">
            <IconButton
              size="sm"
              icon={<X />}
              aria-label="Remove NFT"
              onClick={removeNft}
            />
          </Tooltip>
        </HStack>
        <Image
          src={preview}
          alt="Placeholder"
          height="100%"
          maxHeight="180px"
          width="auto"
        />
        {fields.map((_field, traitIndex) => (
          <TraitInput
            key={traitIndex}
            nftIndex={index}
            traitIndex={traitIndex}
            unselectTrait={() => remove(traitIndex)}
          />
        ))}
        <IconButton
          onClick={addTrait}
          width="full"
          size="xs"
          icon={<Plus />}
          aria-label="Add a new trait"
        />
      </VStack>
    </Card>
  )
}

export default NFTCard

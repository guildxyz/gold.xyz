import { HStack, IconButton, Image, Input, Tooltip, VStack } from "@chakra-ui/react"
import Card from "components/common/Card"
import { Plus, X } from "phosphor-react"
import { useEffect } from "react"
import { useFieldArray, useFormContext, useWatch } from "react-hook-form"
import TraitInput from "./TraitInput"

type Props = {
  index: number
  removeNft: () => void
}

const NFTCard = ({ index, removeNft }: Props) => {
  const { register } = useFormContext()
  const preview = useWatch({ name: `nfts.${index}.preview` })
  const { fields, append, remove } = useFieldArray({ name: `nfts.${index}.traits` })

  const addTrait = () =>
    append({
      key: "",
      value: "",
    })

  useEffect(() => {
    // This condition should only be needed for dev mode
    if (fields.length <= 0) {
      addTrait()
      addTrait()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Card>
      <VStack p={5}>
        <HStack>
          <Input placeholder="NFT Name" {...register(`nfts.${index}.name`)} />
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
        {fields.map((field, traitIndex) => (
          <TraitInput
            key={field.id}
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

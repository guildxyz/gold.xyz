import {
  Button,
  Center,
  HStack,
  IconButton,
  Image,
  Progress,
  Text,
  Tooltip,
  VStack,
} from "@chakra-ui/react"
import Card from "components/common/Card"
import CardMotionWrapper from "components/common/CardMotionWrapper"
import { Plus, TrashSimple } from "phosphor-react"
import { useEffect } from "react"
import { useFieldArray, useFormContext, useWatch } from "react-hook-form"
import TraitInput from "./TraitInput"

type Props = {
  index: number
  progress: number
  imageHash: string
  removeNft: () => void
}

const NFTCard = ({ index, imageHash, progress, removeNft }: Props) => {
  const name = useWatch({ name: "asset.name" })
  const isRepeated = useWatch({ name: "asset.isRepeated" })
  const preview = useWatch({ name: `nfts.${index}.preview` })
  const { fields, append, remove } = useFieldArray({ name: `nfts.${index}.traits` })
  const { setValue } = useFormContext()

  const addTrait = () =>
    append({
      key: "",
      value: "",
    })

  useEffect(() => {
    if (imageHash.length > 0) setValue(`nfts.${index}.hash`, imageHash)
  }, [setValue, imageHash, index])

  return (
    <CardMotionWrapper zIndex="1">
      <Card>
        <Center bg="gray.900" h="180px">
          <Image src={preview} alt="Placeholder" height="100%" width="auto" />
        </Center>{" "}
        <Progress
          width="full"
          value={progress * 100}
          colorScheme="primary"
          size="xs"
          backgroundColor="transparent"
        />
        <VStack p="5" pt="3" spacing="3">
          <HStack width="full" justifyContent="space-between">
            <Text fontWeight="bold">{`${name} #${
              isRepeated ? "[0, 1, ...]" : index + 1
            }`}</Text>
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
            aria-label="Add property"
          >
            Add property
          </Button>
        </VStack>
      </Card>
    </CardMotionWrapper>
  )
}

export default NFTCard

import {
  Button,
  Divider,
  Input,
  InputGroup,
  InputRightAddon,
} from "@chakra-ui/react"
import { X } from "phosphor-react"
import { ReactElement } from "react"
import { useFormContext, useWatch } from "react-hook-form"

type Props = {
  nftIndex: number
  traitIndex: number
  unselectTrait: () => void
}

const TraitInput = ({
  nftIndex,
  traitIndex,
  unselectTrait,
}: Props): ReactElement => {
  const { register } = useFormContext()
  const key = useWatch({ name: `nfts.${nftIndex}.traits.${traitIndex}.key` })

  return (
    <InputGroup size="sm">
      <Input
        borderRightWidth={0}
        borderRightRadius={0}
        placeholder={"eg.: color"}
        {...register(`nfts.${nftIndex}.traits.${traitIndex}.key`)}
      />

      <Divider orientation="vertical" />

      <Input
        borderLeftWidth={0}
        borderLeftRadius={0}
        placeholder={"eg.: red"}
        {...register(`nfts.${nftIndex}.traits.${traitIndex}.value`)}
      />
      {key.length <= 0 && (
        <InputRightAddon p="0" overflow="hidden" bg="gray.700">
          <Button
            onClick={unselectTrait}
            size="sm"
            variant="ghost"
            borderRadius="0"
            px="2"
            aria-label="Remove property"
          >
            <X />
          </Button>
        </InputRightAddon>
      )}
    </InputGroup>
  )
}

export default TraitInput

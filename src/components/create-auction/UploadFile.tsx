import {
  Box,
  FormControl,
  FormErrorMessage,
  Icon,
  Stack,
  Text,
  useColorMode,
} from "@chakra-ui/react"
import { FilePlus } from "phosphor-react"
import { Dispatch, SetStateAction } from "react"
import { useFormContext, useWatch } from "react-hook-form"
import useDropzone from "./hooks/useDropzone"

type Props = {
  setPreviews: Dispatch<SetStateAction<Record<string, string>>>
}

const UploadFile = ({ setPreviews }: Props) => {
  const {
    setValue,
    formState: { errors },
  } = useFormContext()

  const nfts = useWatch({ name: "nfts" })

  const addNfts = (
    data: {
      file: File
      traits: Array<{ key: string; value: string }>
    }[]
  ) => {
    const currentIds = Object.keys(nfts).map(parseInt)
    const newId = currentIds.length === 0 ? 0 : Math.max(...currentIds) + 1
    const newNfts = data.map((file, i) => [newId + i, file])
    setValue("nfts", { ...nfts, ...Object.fromEntries(newNfts) })
    return newNfts.map(([id]) => id)
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (files) => {
      const newIds = addNfts(
        files.map((file) => ({
          file,
          traits: [],
        }))
      )

      setPreviews((prev) => ({
        ...prev,
        ...Object.fromEntries(
          files.map((file, i) => [newIds[i], URL.createObjectURL(file)])
        ),
      }))
    },
  })

  const { colorMode } = useColorMode()

  return (
    <FormControl isInvalid={!!errors.nftImage} d="flex" flexDir="column">
      <input id="dropzone" {...getInputProps()} hidden />
      <Box
        {...getRootProps()}
        as="label"
        htmlFor="dropzone"
        width="full"
        height="full"
        minH="320px"
        _hover={{
          textDecor: "none",
          bg: colorMode === "light" ? "gray.100" : "whiteAlpha.50",
        }}
        borderRadius="2xl"
        display="flex"
        px={{ base: 5, sm: 7 }}
        py={7}
        borderWidth={2}
        borderColor={colorMode === "light" ? "gray.200" : "gray.600"}
        cursor="pointer"
        justifyContent="center"
        alignItems="center"
      >
        <Stack direction="row" spacing={5} alignItems="center">
          <Icon
            as={FilePlus}
            boxSize={8}
            color={colorMode === "light" ? "gray.300" : "gray.500"}
          />
          <Text
            fontWeight="bold"
            color={colorMode === "light" ? "gray.400" : "gray.500"}
          >
            {isDragActive ? "Drop files here" : "Add image(s)"}
          </Text>
        </Stack>
      </Box>

      <FormErrorMessage>
        {errors.nftImage && errors?.nftImage.message}
      </FormErrorMessage>
    </FormControl>
  )
}

export default UploadFile

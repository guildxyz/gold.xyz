import {
  Box,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Icon,
  Stack,
  Text,
  useColorMode,
} from "@chakra-ui/react"
import { File } from "phosphor-react"
import { FieldArrayMethodProps, useFormContext } from "react-hook-form"
import useDropzone from "./hooks/useDropzone"

type Props = {
  addNft: (
    value: Partial<unknown> | Partial<unknown>[],
    options?: FieldArrayMethodProps
  ) => void
}

const UploadFile = ({ addNft }: Props) => {
  const {
    formState: { errors },
  } = useFormContext()
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (files) =>
      files.forEach((file) =>
        addNft({
          file,
          traits: [],
          preview: URL.createObjectURL(file),
        })
      ),
  })

  const { colorMode } = useColorMode()

  return (
    <FormControl isInvalid={!!errors.nftImage} h="full" d="flex" flexDir="column">
      <FormLabel>Upload file(s)</FormLabel>

      <input id="dropzone" {...getInputProps()} hidden />
      <Box
        {...getRootProps()}
        as="label"
        htmlFor="dropzone"
        width="full"
        height="full"
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
            as={File}
            boxSize={8}
            color={colorMode === "light" ? "gray.300" : "gray.500"}
          />
          <Text
            fontWeight="bold"
            color={colorMode === "light" ? "gray.400" : "gray.500"}
          >
            {isDragActive ? "Drop files" : "Click here or drop here some images"}
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

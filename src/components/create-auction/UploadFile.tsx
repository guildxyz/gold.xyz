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
import { DropzoneInputProps, DropzoneRootProps } from "react-dropzone"
import { useFormContext } from "react-hook-form"

type Props = {
  dropzoneProps: DropzoneRootProps
  inputProps: DropzoneInputProps
  isDragActive: boolean
}

const UploadFile = ({ dropzoneProps, inputProps, isDragActive }: Props) => {
  const {
    formState: { errors },
  } = useFormContext()

  const { colorMode } = useColorMode()

  return (
    <FormControl isInvalid={!!errors.nftImage} d="flex" flexDir="column">
      <input id="dropzone" {...inputProps} hidden />
      <Box
        {...dropzoneProps}
        as="label"
        htmlFor="dropzone"
        width="full"
        height="full"
        minH="300px"
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

import {
  Box,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Icon,
  Image,
  Stack,
  Text,
  useColorMode,
} from "@chakra-ui/react"
import FileInput from "components/common/FileInput"
import { File } from "phosphor-react"
import { useState } from "react"
import { useFormContext } from "react-hook-form"

const UploadFile = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext()
  const [photoPreview, setPhotoPreview] = useState<string>()

  const validateFiles = (e: FileList) => {
    const file = e?.[0]
    if (!file) return "File is required"

    const fsMb = file.size / (1024 * 1024)
    const MAX_FILE_SIZE = 10
    if (fsMb > MAX_FILE_SIZE) return "Max file size is 10mb"

    // act's like onChange if it's valid
    setPhotoPreview(URL.createObjectURL(file))
    return true
  }

  const { colorMode } = useColorMode()

  return (
    <FormControl isInvalid={!!errors.nftImage} h="full" d="flex" flexDir="column">
      <FormLabel>Upload file</FormLabel>

      <FileInput
        accept={"image/*"}
        register={register("nftImage", {
          validate: validateFiles,
        })}
      >
        <Box
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
          {photoPreview ? (
            <Image
              src={photoPreview}
              alt="Placeholder"
              height="100%"
              maxHeight="180px"
              width="auto"
            />
          ) : (
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
                Select image
              </Text>
            </Stack>
          )}
        </Box>
      </FileInput>

      <FormErrorMessage>
        {errors.nftImage && errors?.nftImage.message}
      </FormErrorMessage>
    </FormControl>
  )
}

export default UploadFile

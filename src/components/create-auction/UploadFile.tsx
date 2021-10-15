import {
  Box,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Icon,
  Image,
  InputGroup,
  Stack,
  Text,
  useColorMode,
} from "@chakra-ui/react"
import { File } from "phosphor-react"
import { ReactNode, useEffect, useRef, useState } from "react"
import { useFormContext, UseFormRegisterReturn, useWatch } from "react-hook-form"

type FileUploadProps = {
  register: UseFormRegisterReturn
  accept?: string
  children?: ReactNode
}

const FileUpload = (props: FileUploadProps) => {
  const { register, accept, children } = props
  const inputRef = useRef<HTMLInputElement | null>(null)
  const { ref, ...rest } = register as {
    ref: (instance: HTMLInputElement | null) => void
  }

  const handleClick = () => inputRef.current?.click()

  return (
    <InputGroup onClick={handleClick} flex="1">
      <input
        type="file"
        hidden
        accept={accept}
        {...rest}
        ref={(e) => {
          ref(e)
          inputRef.current = e
        }}
      />
      <>{children}</>
    </InputGroup>
  )
}

const UploadFile = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext()
  const [pickedPhoto, setPickedPhoto] = useState<File>()
  const [photoPreview, setPhotoPreview] = useState<string>()

  const file = useWatch({ name: "nftImage" })
  useEffect(() => {
    setPickedPhoto(file?.[0])
  }, [file])

  const validateFiles = (value: FileList) => {
    if (value.length < 1) return "File is required"
    for (const actFile of Array.from(value)) {
      const fsMb = actFile.size / (1024 * 1024)
      const MAX_FILE_SIZE = 10
      if (fsMb > MAX_FILE_SIZE) {
        return "Max file size 10mb"
      }
    }
    return true
  }

  useEffect(() => {
    if (pickedPhoto) {
      setPhotoPreview(URL.createObjectURL(pickedPhoto))
    }
  }, [pickedPhoto])

  const { colorMode } = useColorMode()

  return (
    <FormControl isInvalid={!!errors.nftImage} h="full" d="flex" flexDir="column">
      <FormLabel>Upload file</FormLabel>

      <FileUpload
        accept={"image/*"}
        register={register("nftImage", { validate: validateFiles })}
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
      </FileUpload>

      <FormErrorMessage>
        {errors.nftImage && errors?.nftImage.message}
      </FormErrorMessage>
    </FormControl>
  )
}

export default UploadFile

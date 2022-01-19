import { FormControl, FormErrorMessage, Grid, HStack, Input } from "@chakra-ui/react"
import CardMotionWrapper from "components/common/CardMotionWrapper"
import Section from "components/common/Section"
import UploadFile from "components/create-auction/UploadFile"
import { AnimateSharedLayout } from "framer-motion"
import { useCallback, useEffect, useState } from "react"
import { useFieldArray, useFormContext, useWatch } from "react-hook-form"
import NFTCard from "./components/NFTCard"
import useDropzone from "./hooks/useDropzone"
import useUploadFiles from "./hooks/useUploadFiles"

type Props = {
  setIsUploadLoading: (isLoading: boolean) => void
}

const NFTData = ({ setIsUploadLoading }) => {
  const [progresses, setProgresses] = useState<Record<string, number>>({})
  const [hashes, setHashes] = useState<Record<string, string>>({})
  const { fields, append, remove } = useFieldArray({ name: "nfts" })
  const {
    register,
    setValue,
    formState: { errors },
  } = useFormContext()

  const nfts = useWatch({ name: "nfts" })

  useEffect(() => {
    register("asset.isRepeated")
  }, [])

  useEffect(() => {
    if (nfts.length === 1) setValue("asset.isRepeated", true)
    else setValue("asset.isRepeated", false)
  }, [nfts])

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      append(
        acceptedFiles.map((file) => ({
          file,
          traits: [],
          preview: URL.createObjectURL(file),
        }))
      )
    },
    [append]
  )

  const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
    onDrop,
  })

  const { isLoading, onSubmit } = useUploadFiles({
    setHashes,
    setProgresses,
    fields,
    acceptedFiles,
  })

  useEffect(() => setIsUploadLoading(isLoading), [isLoading, setIsUploadLoading])

  // Not triggering upload on acceptedFiles change (or onDrop), since we need the generated field ids
  useEffect(() => {
    onSubmit()
  }, [fields])

  return (
    <>
      <Section title="NFT collection name and symbol">
        <HStack alignItems="start">
          <FormControl isInvalid={errors?.asset?.name} maxWidth="sm" w="full">
            <Input
              size="lg"
              {...register("asset.name", {
                required: "This field is required.",
              })}
            />
            <FormErrorMessage>{errors?.asset?.name?.message}</FormErrorMessage>
          </FormControl>
          <FormControl isInvalid={errors?.asset?.symbol} w="auto">
            <Input
              size="lg"
              w="24"
              placeholder="SYMBL"
              {...register("asset.symbol", {
                required: "This field is required.",
              })}
            />
            <FormErrorMessage>{errors?.asset?.symbol?.message}</FormErrorMessage>
          </FormControl>
        </HStack>
      </Section>
      <Section title="NFTs to mint">
        <Grid
          templateColumns={{ sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" }}
          gap="6"
          w="full"
        >
          <AnimateSharedLayout>
            {/* temporarily removing until we find a good solution because it's buggy with useFieldArray */}
            {/* <AnimatePresence> */}
            {fields.map((field, index) => (
              <NFTCard
                key={field.id}
                index={index}
                removeNft={() => remove(index)}
                progress={progresses[field.id] ?? 0}
                imageHash={hashes[field.id] ?? ""}
              />
            ))}
            {/* </AnimatePresence> */}
            <CardMotionWrapper>
              <UploadFile
                dropzoneProps={getRootProps()}
                inputProps={getInputProps()}
                isDragActive={isDragActive}
              />
            </CardMotionWrapper>
          </AnimateSharedLayout>
        </Grid>
      </Section>
    </>
  )
}

export default NFTData

import { FormControl, FormErrorMessage, Grid, HStack, Input } from "@chakra-ui/react"
import CardMotionWrapper from "components/common/CardMotionWrapper"
import Section from "components/common/Section"
import UploadFile from "components/create-auction/UploadFile"
import { AnimateSharedLayout } from "framer-motion"
import { useCallback, useEffect, useState } from "react"
import { useFieldArray, useFormContext, useWatch } from "react-hook-form"
import { v4 as uuidv4 } from "uuid"
import NFTCard from "./components/NFTCard"
import useDropzone from "./hooks/useDropzone"

const uploadImages = async (
  files: File[],
  clientId: string,
  ids: string[]
): Promise<Record<string, string>> => {
  const formData = new FormData()
  files.forEach((file, index) => formData.append(ids[index], file))

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_UPLOADER_API}/upload-file/${clientId}`,
    {
      method: "POST",
      body: formData,
    }
  )

  const body = await response.json()

  if (response.ok) return body
  else throw Error(body.message ?? "Failed to upload images")
}

const NFTData = () => {
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

  const setupEventSource = useCallback((clientId: string) => {
    const source = new EventSource(
      `${process.env.NEXT_PUBLIC_UPLOADER_API}/${clientId}`
    )

    source.addEventListener("progress", (event: Event) => {
      try {
        const progressReport = JSON.parse((event as Event & { data: string }).data)
        setProgresses((prev) => ({ ...prev, ...progressReport }))
      } catch (error) {
        console.error(`Failed to parse SSE "progress" event message`, error)
      }
    })

    return source
  }, [])

  useEffect(() => {
    if (acceptedFiles.length > 0) {
      const uploadProgressId = uuidv4()
      const progressEventSource = setupEventSource(uploadProgressId)

      uploadImages(
        acceptedFiles,
        uploadProgressId,
        fields.slice(fields.length - acceptedFiles.length).map((field) => field.id)
      )
        .then((hashReport) => setHashes((prev) => ({ ...prev, ...hashReport })))
        .finally(() => progressEventSource.close())
    }
  }, [setupEventSource, fields]) // Intentionally leaving out acceptedFiles

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

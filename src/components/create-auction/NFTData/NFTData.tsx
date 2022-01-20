import { FormControl, FormErrorMessage, Grid, HStack, Input } from "@chakra-ui/react"
import CardMotionWrapper from "components/common/CardMotionWrapper"
import Section from "components/common/Section"
import UploadFile from "components/create-auction/UploadFile"
import { AnimateSharedLayout } from "framer-motion"
import useToast from "hooks/useToast"
import { useCallback, useEffect, useState } from "react"
import { useFieldArray, useFormContext, useWatch } from "react-hook-form"
import { v4 as uuidv4 } from "uuid"
import NFTCard from "./components/NFTCard"
import useDropzone from "./hooks/useDropzone"

type Props = {
  setUploadPromise: (uploadPromise: Promise<Record<string, string>>) => void
}

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

const NFTData = ({ setUploadPromise }: Props) => {
  const toast = useToast()
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

  const onDrop = (acceptedFiles: File[]) => {
    append(
      acceptedFiles.map((file) => ({
        file,
        traits: [],
        preview: URL.createObjectURL(file),
      }))
    )
  }

  const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
    onDrop,
  })

  const setupEventSource = useCallback(
    (clientId: string) =>
      new Promise<EventSource>((resolve, reject) => {
        const source = new EventSource(
          `${process.env.NEXT_PUBLIC_UPLOADER_API}/${clientId}`
        )

        source.addEventListener("progress", (event: Event) => {
          try {
            const progressReport: Record<string, number> = JSON.parse(
              (event as Event & { data: string }).data
            )
            setProgresses((prev: Record<string, number>) => ({
              ...prev,
              ...progressReport,
            }))
          } catch (error) {
            console.error(`Failed to parse SSE "progress" event message`, error)
          }
        })

        source.addEventListener("open", () => resolve(source))

        source.addEventListener("error", () =>
          reject(Error("Failed to open SSE connection"))
        )
      }),
    [setProgresses]
  )

  // Not triggering upload on acceptedFiles change, since we need the generated field ids
  useEffect(() => {
    if (acceptedFiles.length > 0) {
      const uploadProgressId = uuidv4()
      setupEventSource(uploadProgressId)
        .then((progressEventSource) =>
          setUploadPromise(
            uploadImages(
              acceptedFiles,
              uploadProgressId,
              fields
                .slice(fields.length - acceptedFiles.length)
                .map((field) => field.id)
            )
              .then((hashReport) => {
                setHashes((prev) => ({ ...prev, ...hashReport }))
                return hashReport
              })
              .catch((e) => {
                toast({
                  status: "error",
                  title: "Upload failed",
                  description: e?.message ?? "Failed to upload images",
                })
                return {}
              })
              .finally(() => progressEventSource.close())
          )
        )
        .catch((e) => {
          console.error("Failed to open SSE connection", e)
          toast({
            status: "error",
            title: "Upload failed",
            description: e?.message ?? "Failed to upload images",
          })
        })
    }
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

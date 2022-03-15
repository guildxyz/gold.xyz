import {
  Button,
  chakra,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerOverlay,
  FormControl,
  FormLabel,
  Textarea,
  VStack,
} from "@chakra-ui/react"
import DrawerHeader from "components/common/DrawerHeader"
import EncorePeriod from "components/create-auction/EncorePeriod"
import useAuction from "components/[auction]/hooks/useAuction"
import { useRef } from "react"
import { FormProvider, useForm } from "react-hook-form"
import useEditAuction from "../hooks/useEditAuction"

type Props = {
  isOpen: boolean
  onClose: () => void
}

const EditModal = ({ isOpen, onClose }: Props) => {
  const btnRef = useRef()

  const { auction } = useAuction()

  const editForm = useForm({
    mode: "all",
    defaultValues: {
      description: auction?.description ?? "",
      socials: auction?.socials ?? [],
      encorePeriod:
        typeof auction?.encorePeriod === "number" ? auction.encorePeriod / 60 : "",
    },
  })

  const { isLoading, onSubmit } = useEditAuction()

  return (
    <Drawer
      isOpen={isOpen}
      placement="left"
      onClose={onClose}
      finalFocusRef={btnRef}
      size="md"
      colorScheme="gray"
    >
      <chakra.form onSubmit={editForm.handleSubmit(onSubmit)}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerBody>
            <FormProvider {...editForm}>
              <DrawerHeader title="Edit Auction" />

              <VStack spacing={5} alignItems="start">
                <FormControl>
                  <FormLabel>Description</FormLabel>
                  <Textarea
                    placeholder="Optional"
                    {...editForm.register("description")}
                  />
                </FormControl>

                <EncorePeriod
                  showLabel
                  cyclePeriodInSeconds={auction?.cyclePeriod}
                />
              </VStack>
            </FormProvider>
          </DrawerBody>

          <DrawerFooter>
            <Button variant="outline" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="indigo"
              type="submit"
              isLoading={isLoading}
              loadingText="Saving"
            >
              Save
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </chakra.form>
    </Drawer>
  )
}

export default EditModal

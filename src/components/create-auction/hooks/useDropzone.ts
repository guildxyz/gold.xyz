import useToast from "hooks/useToast"
import {
  DropEvent,
  FileRejection,
  useDropzone as useReactDropzone,
} from "react-dropzone"

type Props = {
  onDrop?: (
    acceptedFiles: File[],
    fileRejections: FileRejection[],
    event: DropEvent
  ) => void
  maxFileSizeMb?: number
}

const useDropzone = ({ onDrop, maxFileSizeMb = 10 }: Props) => {
  const toast = useToast()

  const dropzone = useReactDropzone({
    onDrop: (acceptedFiles, fileRejections, event) => {
      fileRejections.forEach((file) =>
        toast({
          status: "error",
          title: "File rejected",
          description: `File "${file.file.name}" is greater than 10mb`,
        })
      )
      onDrop?.(acceptedFiles, fileRejections, event)
    },
    accept: "image/*",
    maxSize: maxFileSizeMb * 1024 * 1024,
    noClick: true,
  })

  return dropzone
}

export default useDropzone

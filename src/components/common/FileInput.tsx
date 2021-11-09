import { InputGroup } from "@chakra-ui/react"
import { PropsWithChildren, useRef } from "react"
import { UseFormRegisterReturn } from "react-hook-form"

type Props = {
  register: UseFormRegisterReturn
  accept?: string
}

const FileInput = ({
  register,
  accept,
  children,
}: PropsWithChildren<Props>): JSX.Element => {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const { ref, ...rest } = register

  const handleClick = () => inputRef.current?.click()

  return (
    <InputGroup onClick={handleClick} w="auto" flex="1">
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
      {children}
    </InputGroup>
  )
}

export default FileInput

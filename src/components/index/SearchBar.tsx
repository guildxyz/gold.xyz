import { Icon, Input, InputGroup, InputLeftElement } from "@chakra-ui/react"
import { MagnifyingGlass } from "phosphor-react"
import React, { useRef } from "react"

const SearchBar = ({ setSearchInput }) => {
  const inputTimeout = useRef(null)
  const handleOnChange = async ({ target: { value } }) => {
    window.clearTimeout(inputTimeout.current)
    inputTimeout.current = setTimeout(() => setSearchInput(value), 300)
  }

  return (
    <InputGroup size="lg" w="100%">
      <InputLeftElement>
        <Icon color="#858585" size={20} as={MagnifyingGlass} />
      </InputLeftElement>
      <Input
        placeholder="Search auctions"
        overflow="hidden"
        whiteSpace="nowrap"
        textOverflow="ellipsis"
        colorScheme="primary"
        id="searchBar"
        onChange={handleOnChange}
      />
    </InputGroup>
  )
}

export default SearchBar

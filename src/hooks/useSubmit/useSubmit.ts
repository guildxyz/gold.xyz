import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { useMachine } from "@xstate/react"
import { useRef } from "react"
import createFetchMachine, { Context, Event } from "./utils/fetchMachine"

type Options<ResponseType> = {
  onSuccess?: (response: ResponseType) => void
  onError?: (error: any) => void
}

const useSubmit = <DataType, ResponseType>(
  fetch: (data: DataType) => Promise<ResponseType>,
  { onSuccess, onError }: Options<ResponseType> = {}
) => {
  const { connection } = useConnection()
  const { publicKey, sendTransaction } = useWallet()

  // xState does not support passing different objects on different renders,
  // using a ref here, so we have the same object on all renders
  const machine = useRef(createFetchMachine<DataType, ResponseType>())
  const [state, send] = useMachine<Context<ResponseType>, Event<DataType>>(
    machine.current,
    {
      services: {
        fetch: (_context, event) => {
          // needed for typescript to ensure that event always has data property
          if (event.type !== "FETCH") return
          return fetch(event.data)
        },
      },
      actions: {
        onSuccess: (context) => {
          onSuccess?.(context.response)
        },
        onError: async (context) => {
          const err = await context.error
          onError?.(err)
        },
      },
    }
  )

  return {
    ...state.context,
    onSubmit: (data?: DataType) => send({ type: "FETCH", data }),
    isLoading: state.matches("fetching"),
  }
}

export default useSubmit

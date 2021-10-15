import Layout from "components/common/Layout"
import useAuction from "components/[auction]/hooks/useAuction"

const Page = (): JSX.Element => {
  const auction = useAuction()

  return <Layout title={auction?.name}></Layout>
}

export default Page

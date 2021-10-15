import Layout from "components/common/Layout"
import useTreasury from "components/[treasury]/hooks/useTreasury"

const Page = (): JSX.Element => {
  const treasury = useTreasury()

  return <Layout title={treasury?.name}></Layout>
}

export default Page

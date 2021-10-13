// import Layout from "components/common/Layout"
// import fetchData from "components/index/utils/fetchData"
import Layout from "components/common/Layout"
// import { Data } from "temporaryData/types"

// type Props = {
//   data: Data[]
// }

const Page = (): JSX.Element => {
  // const { data } = useSWR("data", fetchData, {
  //   fallbackData: dataInitial,
  // })

  return <Layout title="Home"></Layout>
}

// export const getStaticProps: GetStaticProps = async () => {
//   const data = await fetchData()

//   return {
//     props: { data },
//     revalidate: 10,
//   }
// }

export default Page

import { QueryProps } from '@/containers/Claim/types'
import { wrapper } from '@/redux/store'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'

const ClaimComponent = dynamic(
  () => import('@/containers/Claim').then((res) => res.default),
  {
    ssr: false,
  },
)

const ClaimPage = () => {
  const router = useRouter()

  useEffect(() => {
    localStorage.removeItem('openlogin_store')
    localStorage.removeItem('Web3Auth-cachedAdapter')
  }, [])

  const [query, setQuery] = useState<QueryProps>({
    firstname: '',
    lastname: '',
    eventname: '',
    batchid: '',
    emailid: '',
  })

  useEffect(() => {
    const query = router.query

    if (query) {
      setQuery({
        firstname: query.firstname as string,
        lastname: query.lastname as string,
        emailid: query.emailid as string,
        batchid: query.batchid as string,
        eventname: query.eventname as string,
      })
    }
  }, [router.query])

  return <ClaimComponent query={query} />
}

export default wrapper.withRedux(ClaimPage)

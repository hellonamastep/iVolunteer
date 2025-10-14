import Blogheader from '@/components/Blogheader'
import Bloghero from '@/components/Bloghero'
import Blogstories from '@/components/Blogstories'
import Footer from '@/components/Footer'
import { Header } from '@/components/header'
import React from 'react'

const page = () => {
  return (
    <div>
        <Header/>
        <Blogheader/>
        <Bloghero/>
        <Blogstories/>
        <Footer/>
    </div>
  )
}

export default page
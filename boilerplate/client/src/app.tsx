import React, { useEffect, useState } from 'react'
import './app/styles/app.scss'
import axios from 'axios'

function App() {
  const [data, setData] = useState({ hello: 'notworld' })
  const port = process.env.NODE_ENV === 'test' ? 7778 : 7777
  useEffect(() => {
    async function doit() {
      const stuff = await axios.get(`http://localhost:${port}/ping`)
      setData(stuff.data as any)
    }
    doit()
  })

  return <h1>hello: {data.hello}</h1>
}

export default App

import GlobeEarth from './components/globe';
import './App.css';
import { receivedData } from './util/fakedata';
import { fetchExchangeData } from './util/fetchExchangeInfo';
import { useEffect, useState, useMemo, Suspense } from 'react';

function App() {

  const [exchanges, setExchanges] = useState()
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filteredExchanges, setFilteredExchanges] = useState()

  useEffect(() => {
    console.log(search)
    const filtered = exchanges?.filter((e) => {
      return e.Name.toLowerCase().includes(search.toLowerCase())
    })
    console.log("filtered: ", filtered)
    setFilteredExchanges(filtered)
  }, [search])

  useEffect(() => {

    async function fetch() {
        const body = await fetchExchangeData()
        setExchanges(Object.values(body))
        setFilteredExchanges(Object.values(body))
        setLoading(false)
    }
    fetch()
  }, [])

  return (
    <div className="w-full h-screen text-white cursor-default overflow-hidden">
      <main className="flex flex-col absolute h-[10%] w-full">
        <div className="mx-auto my-auto transition delay-300 opacity-100 hover:opacity-0">Crypto exchange visualization</div>
      </main>
      <div className="opacity-0 md:absolute z-50 absolute w-[20%] h-screen lg:flex flex-col bg-zinc-900 p-4 overflow-scroll lg:opacity-100">
        <div className="text-2xl mb-4 px-2">Dashboard</div>
        <div className="flex flex-row justify-between mx-2 my-4 text-zinc-300">
          <div>Name</div>
          <div>24H BTC Volume</div>
        </div>
        <input placeholder="Search" className="bg-zinc-800 rounded-lg p-2 mb-4" value={search} onChange={(e) => setSearch(e.target.value)}></input>
        {loading ? <div className="text-white mx-auto mt-10">Loading...</div> : 
                  filteredExchanges?.map((e) => 
                    <div className="flex flex-row justify-between text-left rounded-lg p-2 hover:bg-zinc-800" key={e.Name}>
                        <div className="">{e.Name}</div>
                        <div>{e.TOTALVOLUME24H.BTC.toString().split('').slice(0, 8)}</div>
                    </div>
                    )
        }

      </div>
      <GlobeEarth array={exchanges} />
    </div>
  );
}

export default App;

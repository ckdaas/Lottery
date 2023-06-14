import { useState, useEffect } from 'react'
import Head from 'next/head'
import Web3 from 'web3'
import lotteryContract from '../blockchain/lottery'
import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css'
import 'bulma/css/bulma.css'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  const [web3, setWeb3] = useState()
  const [address, setAddress] = useState()
  const [lcContract, setLcContract] = useState()
  const [lotteryPot, setLotteryPot] = useState()
  const [lotteryPlayers, setPlayers] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    if (lcContract) getPot()
    if (lcContract) getPlayers()
  }, [lcContract])

  const getPot = async () => {
    const pot = await lcContract.methods.getBalance().call()
    setLotteryPot(web3.utils.fromWei(pot, 'ether'))
  }

  const getPlayers = async () => {
    const players = await lcContract.methods.getPlayers().call()
    setPlayers(players)
  }

  const enterLotteryHandler = async () => {
    try {
      await lcContract.methods.enter().send({
        from: address,
        value: web3.utils.toWei('0.015', 'ether'),
        gas: 300000,
        gasPrice: null
      })
    } catch (err) {
      setError(err.message)
    }
  }

  const connectWalletHandler = async () => {
    /* Check if MetaMask is installed */
    if (typeof window !== "undefined"  && typeof window.ethereum !== "undefined") {
      try {
        /* Request wallet connection */
        await window.ethereum.request({ method: "eth_requestAccounts" })
        /* create web3 instance & set to state */
        const web3 = new Web3(window.ethereum)
        /* set web3 in React state */
        setWeb3(web3)
        /* get list of accounts */
        const accounts = await web3.eth.getAccounts()
        /* set account 1 in React state */
        setAddress(accounts[0])

        /* create local contract copy */
        const lc = lotteryContract(web3)
        setLcContract(lc)
      } catch (err) {
        setError(err.message)
      }
    } else {
      console.log("Please install MetaMask")
    }
  }

  return (
    <>
      <Head>
        <title>Ether Lottery</title>
        <meta name="description" content="Ethereum Lottery dApp" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={`${styles.main} ${inter.className}`}>
        <nav className="navbar mt-4 mb-4">
          <div className="container">
            <div className="navbar-brand">
              <h1>Ether Lottery</h1>
            </div>
            <div className="navbar-end">
              <button onClick={connectWalletHandler} className="button is-link">Connect Wallet</button>
            </div>
          </div>
        </nav>
        <div className="container">
          <section className="mt-5">
            <div className="columns">
              <div className="column is-two-thirds">
                <section className="mt-5">
                  <p>Enter the lottery by sending 0.01 Ether</p>
                  <button onClick={enterLotteryHandler} className="button is-link is-large is-light mt-3">Play now</button>
                </section>
                <section className="mt-6">
                  <p><b>Admin only:</b> Pick winner</p>
                  <button className="button is-primary is-large is-light mt-3">Pick winner</button>
                </section>
                <section>
                  <div className="container has-text-danger">
                    <p>{error}</p>
                  </div>
                </section>
              </div>
              <div className={`${styles.lotteryinfo} column is-one-third`}>
                <section className="mt-5">
                  <div className="card">
                    <div className="card-content">
                      <div className="content">
                        <h2>Lottery History</h2>
                        <div className="history-entry">
                          <div>Lottery #1 winner:</div>
                          <div>
                            <a href="https://sepolia.etherscan.io/address/0xd84ab8643a260903ab0f3a9a501bb253101bb069" target="_blank">
                              0xd84aB8643a260903ab0F3A9a501bb253101bB069
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
                <section className="mt-5">
                  <div className="card">
                    <div className="card-content">
                      <div className="content">
                        <h2>Players ({lotteryPlayers.length})</h2>
                        <ul className="ml-0">
                          {
                            (lotteryPlayers && lotteryPlayers.length > 0) && lotteryPlayers.map((player, index) => {
                              return <li key={`${player}-${index}`}>
                                <a href={`https://sepolia.etherscan.io/address/${player}`} target="_blank">
                                  {player}
                                </a>
                              </li>
                            })
                          }
                        </ul>
                      </div>
                    </div>
                  </div>
                </section>
                <section className="mt-5">
                  <div className="card">
                    <div className="card-content">
                      <div className="content">
                        <h2>Pot</h2>
                        <p>{lotteryPot} ether</p>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer className={styles.footer}>
        <p>&copy; 2023 Block Explorer</p>
      </footer>
    </>
  )
}

import { useEffect, useState } from 'react';
import { ethers } from 'ethers';

// components 
import Navigation from "./components/Navigation";
import Section from "./components/Section";
import Product from "./components/Product";

// ABIs
import Damazon from "./abis/Damazon.json";

// config file 
import config from "./config.json";

import items from "../src/items.json";

function App() {
    const [damazon, setDamazon] = useState(null);
    const [provider, setProvider] = useState(null);
    const [account, setAccount] = useState(null);
    
    const [electronics, setElectronics] = useState(null);
    const [clothing, setClothing] = useState(null);
    const [toys, setToys] = useState(null);

    const [Item, setItem] = useState({});
    const [toggle, setToggle] = useState(false);

    const togglePop = (item) => {
        setItem(item);
        toggle ? setToggle(false) : setToggle(true);
    }


    const loadBlockchainData = async () => {
        // connect to blockchain
        const provider = new ethers.BrowserProvider(window.ethereum);
        setProvider(provider);

        const network = await provider.getNetwork();

        // connecting to the contract
        const damazon = new ethers.Contract(
            config[network.chainId].Damazon.address,
            Damazon,
            provider
        );
        setDamazon(damazon);

            // list items 
            const items = []

            for (var i = 0; i < 11; i++) {
                const item = await damazon.items(i);
                items.push(item);
            }

            const electronics = items.filter(
              (item) => item.category === "electronics"
            );
        
            const clothing = items.filter(
              (item) => item.category === "clothing"
            );
        
            const toys = items.filter((item) => item.category === "toys");

            setElectronics(electronics);
            setClothing(clothing);
            setToys(toys);
        }

        useEffect(() => {
            loadBlockchainData()
        }, []);

        return (
            <div>
                <Navigation account={account} setAccount={setAccount} />
                <h2>D-amazon✅ Best Sellers!!!</h2>

                {electronics && clothing && toys && (
                    <>
                    <Section title={'Clothing and Jewelry'} items={clothing} togglePop={togglePop}/>
                    <Section title={'Electronics and Gadgets'} items={electronics} togglePop={togglePop} />
                    <Section title={'Toys and Gaming'} items={toys} togglePop={togglePop} />
                    </>
                )}

                {toggle && (
                    <Product item={Item} provider={provider} account={account} damazon={damazon} togglePop={togglePop} />
                )}
            </div>
        );
    }


export default App;
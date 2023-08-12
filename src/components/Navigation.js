import { ethers } from "ethers";

const Navigation = ({ account, setAccount}) => {
    const connectHandler = async () => {
         const accounts = await window.ethereum.request({
           method: "eth_requestAccounts",
         });
         const account = ethers.getAddress(accounts[0]);
         setAccount(account);
    } 
    
    return (
      <nav>
        <div className="nav__brand">
          <h1>Damazon✅</h1>
        </div>
        <input type="text" className="nav__search" />
        
        {/*connecting the wallet*/}
        {account ? (<button type="button" className="nav__connect">
                {account.slice(0,6)+"...."+account.slice(38,42)}
        </button>): (<button type="button" className="nav__connect" onClick={connectHandler}>connect</button>)}    


        <ul className="nav__links">
          <li>
            <a href="#Clothing & Jewelry">Clothing and jewelry</a>
          </li>
          <li>
            <a href="#Electronics and Gadgets">Electronics and Gadgets</a>
          </li>
            <li>
            <a href="#Toys & Gaming"> Toys and Gaming</a>
            </li>    
        </ul>
      </nav>
    );
}

export default Navigation;
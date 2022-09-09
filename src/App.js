import { useState, useEffect } from "react";
import "./App.css";
import { ethers } from "ethers";
import contractData from "./artifacts/contracts/OnChainNFT.sol/OnChainNFT.json";
import db from "./firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { handleNew, handleDelete, handleEdit, handleVote } from "./utils";

const App = () => {
  const [proposals, setProposals] = useState([]);
  const [accounts, setAccounts] = useState(["000"]);
  const [isConnected, setIsConnected] = useState(false);
  const [isHolder, boolIsHolder] = useState(false);

  useEffect(() => {
    const collectionRef = collection(db, "proposals");
    const q = query(collectionRef, orderBy("timestamp", "desc"));

    const unsub = onSnapshot(q, (snapshot) =>
      setProposals(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
    );
    return unsub;
  }, []);

  // ウォレットを持たない人のための読み取り専用のコントラクト (Rinkeby testnet)
  // const rpcURL = process.env.REACT_APP_RINKEBY_RPC_URL;
  // const readOnlyProvider = new ethers.providers.JsonRpcProvider(rpcURL)
  // const readOnlyContract = new ethers.Contract(OnChainNFTAddress, contractData.abi, readOnlyProvider);

  // const NFTAddress = "0x898a7dBFdDf13962dF089FBC8F069Fa7CE92cDBb";
  const NFTAddress = contractData.contractAddress;

  let contract;
  function setContract() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    contract = new ethers.Contract(NFTAddress, contractData.abi, signer);
  }

  // 切り離すとうまくいかない関数
  // async function boolHolder() {
  //   try {
  //     setContract();
  //     const rawBalance = await contract.balanceOf(accounts[0]);
  //     const balance = rawBalance.toNumber();
  //     if(balance !== 0) {
  //       checkIsHolder(true);
  //     }
  //   } catch (err) {
  //     console.log("error: ", err);
  //   }
  // }

  //ウォレット接続
  async function connectAccount() {
    if (window.ethereum) {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setAccounts(accounts);
      setIsConnected(true);
      setContract();

      //balanceOfで該当コントラクトの保有枚数を確認
      //切り離したい
      const rawBalance = await contract.balanceOf(accounts[0]);
      const balance = rawBalance.toNumber();
      console.log(`対象NFT保持数: ${balance}`);
      if (balance > 0) {
        boolIsHolder(true);
      }
    }
  }

  return (
    <div>
      <nav className="navbar navbar-dark bg-dark list-group-item d-flex justify-content-between">
        <h1>
          <span className="navbar-brand">Vote App</span>
        </h1>

        {isConnected ? (
          <div className="btn btn-light">Connected</div>
        ) : (
          <button className="btn btn-primary" onClick={connectAccount}>
            Connect
          </button>
        )}
      </nav>

      <div className="container pt-3 w-75">
        <div className="d-flex mt-3">
          <button
            type="button"
            className="btn btn-primary ms-3"
            onClick={() =>
              isConnected
                ? handleNew(accounts[0])
                : alert("ウォレットを接続してください")
            }
          >
            NewProposal
          </button>
        </div>
        <ul className="list-group mt-3">
          {proposals.map((title) => (
            <li
              key={title.id}
              className="list-group-item d-flex flex-column align-items-start"
            >
              {title.title} ({title.count}) proposer: {title.proposer}
              <div className="ms-auto">
                <button
                  className="btn btn-secondary m-1"
                  onClick={() =>
                    isConnected
                      ? handleEdit(title.id, accounts[0])
                      : alert("ウォレットを接続してください")
                  }
                >
                  edit
                </button>
                <button
                  className="btn btn-danger m-1"
                  onClick={() =>
                    isConnected
                      ? handleDelete(title.id, accounts[0])
                      : alert("ウォレットを接続してください")
                  }
                >
                  delete
                </button>
                {/* <button
                  className="btn btn-warning m-1"
                  onClick={() => approveVote(title.id, accounts[0])}
                >
                  Approve
                </button> */}
                <button
                  className="btn btn-primary m-1"
                  onClick={() =>
                    isConnected
                      ? isHolder
                        ? handleVote(title.id, accounts[0])
                        : alert("NFTホルダーのみ投票出来ます")
                      : alert("ウォレットを接続してください")
                  }
                >
                  Vote
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default App;

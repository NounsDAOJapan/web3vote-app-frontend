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
  const [numOfHolds, setNumOfHolds] = useState(0);
  // const [isHolder, boolIsHolder] = useState(false);

  useEffect(() => {
    const collectionRef = collection(db, "proposals");
    const q = query(collectionRef, orderBy("timestamp", "desc"));

    const unsub = onSnapshot(q, (snapshot) =>
      setProposals(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
    );
    return unsub;
  }, []);

  const NFTAddress = "0x898a7dBFdDf13962dF089FBC8F069Fa7CE92cDBb"; //NounsDAO JAPAN pfp
  // const NFTAddress = contractData.contractAddress; //テスト用オンチェーンNFT

  let contract;
  function setContract() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    contract = new ethers.Contract(NFTAddress, contractData.abi, signer);
  }

  //ウォレット接続
  async function connectAccount() {
    if (window.ethereum) {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setAccounts(accounts);
      setIsConnected(true);
      setContract();

      //balanceOfで該当コントラクトのトークン保有枚数を確認
      //切り分けたい
      const rawBalance = await contract.balanceOf(accounts[0]);
      const balance = rawBalance.toNumber();
      console.log(`対象NFT保持数: ${balance}`);
      if (balance > 0) {
        setNumOfHolds(balance);
        // boolIsHolder(true);
      }
    }
  }

  return (
    <div>
      <nav className="navbar navbar-dark bg-dark list-group-item d-flex justify-content-between">
        <h1>
          <span className="navbar-brand">Vote App(テスト版)</span>
        </h1>
        {isConnected ? (
          //接続後の表示
          <div className="btn btn-light overflow-hidden">
            {`${accounts[0].slice(0,5)}...`}
          </div>
        ) : (
          //接続前の表示
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
          <li className="list-group-item d-flex flex-column align-items-start">
            投票権を持つNFT
            <a
              href={"https://etherscan.io/address/" + NFTAddress}
              target="_blank"
              rel="noreferrer"
            >
              "{NFTAddress}"
            </a>
          </li>
          {proposals.map((title) => (
            <li
              key={title.id}
              className="list-group-item d-flex flex-column align-items-start"
            >
              タイトル: {title.title} ({title.count} 票)
              <br />
              提案者: {title.address.slice(0, 6)}...{title.address.slice(-6)}{" "}
              {title.proposer}
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

                <button
                  className="btn btn-primary m-1"
                  onClick={() =>
                    isConnected
                      ? numOfHolds > 0
                        ? // ? isHolder
                          handleVote(title.id, accounts[0], numOfHolds)
                        : alert("ホルダーのみ投票出来ます")
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

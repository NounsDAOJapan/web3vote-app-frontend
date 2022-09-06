import { useState } from "react";
import "./App.css";
import { ethers } from "ethers";
import ABI from "./artifacts/contracts/OnChainNFT.sol/OnChainNFT.json";

function App() {

  const [proposalText, setProposalText] = useState("");
  const [proposals, setProposalsList] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [isHolder, checkIsHolder] = useState(false);

  // ウォレットを持たない人のための読み取り専用のコントラクト (Rinkeby testnet)
  // const rpcURL = process.env.REACT_APP_RINKEBY_RPC_URL;
  // const readOnlyProvider = new ethers.providers.JsonRpcProvider(rpcURL)
  // const readOnlyContract = new ethers.Contract(OnChainNFTAddress, ABI.abi, readOnlyProvider);

  const OnChainNFTAddress = ABI.contractAddress;

  let contract;
  function setContract() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    contract = new ethers.Contract(OnChainNFTAddress, ABI.abi, signer);
  }

  const isConnected = Boolean(accounts[0]);

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
      setContract();

      //balanceOfで該当コントラクトの保有枚数を確認
      //切り離したい
      const rawBalance = await contract.balanceOf(accounts[0]);
      const balance = rawBalance.toNumber();
      console.log(balance);
      if (balance > 0) {
        checkIsHolder(true);
      }
    }
  }

  //提案
  function handleAddProposal() {
    if (proposalText === "") {
      alert("提案内容を入力してください");
      return;
    }
    if (isHolder) {
      console.log(isHolder);
      let count = 0;
      setProposalsList([...proposals, { text: proposalText, count: count }]);
      setProposalText("");
    } else {
      alert("提案はNFTホルダーのみ可能です");
    }
  }

  const handleChaneText = (e) => {
    setProposalText(e.target.value);
  };

  const ShowProposalList = () => {
    if (proposals.length === 0) {
      return "";
    }

    //提案の削除
    const handleDeleteProposal = (paramIndex) => {
      const newProposals = proposals.filter((data, index) => {
        return index !== paramIndex;
      });
      setProposalsList([...newProposals]);
    };

    //投票
    const handleVoteProposal = (paramIndex) => {
      proposals[paramIndex].count = proposals[paramIndex].count + 1;
      setProposalsList([...proposals]);
    };

    const list = proposals.map((data, index) => {
      return (
        <li
          key={index}
          className="list-group-item d-flex justify-content-between align-items-center"
        >
          {data.text}
          <div>
            <span className="me-2">{data.count}</span>
            <button
              className="btn btn-primary me-2"
              onClick={() => handleVoteProposal(index)}
            >
              VOTE
            </button>
            <button
              className="btn btn-danger"
              onClick={() => handleDeleteProposal(index)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                className="bi bi-trash"
                viewBox="0 0 16 16"
              >
                <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z" />
                <path
                  fillRule="evenodd"
                  d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"
                />
              </svg>
            </button>
          </div>
        </li>
      );
    });

    return <ul className="list-group mt-3">{list}</ul>;
  };

  return (
    <div>
      <nav className="navbar navbar-dark bg-dark list-group-item d-flex justify-content-between">
        <div>
          <span className="navbar-brand">Vote App</span>
        </div>
        {/* true = 接続済, false = コネクトボタン */}
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
          <input
            type="text"
            className="form-control"
            value={proposalText}
            onChange={handleChaneText}
          />
          <button
            type="button"
            className="btn btn-primary ms-3"
            onClick={handleAddProposal}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              className="bi bi-plus"
              viewBox="0 0 16 16"
            >
              <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" />
            </svg>
          </button>
        </div>
        <ShowProposalList />
      </div>
    </div>
  );
}

export default App;

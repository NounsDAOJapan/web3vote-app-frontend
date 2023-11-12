import {
  collection,
  addDoc,
  updateDoc,
  doc,
  deleteDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
  getDoc,
  increment,
} from "firebase/firestore";
import "./App.css";
import db from "./firebase";

//提案作成
export const handleNew = async (address, signer) => {
  const resdata = "";
  const count = 0;
  const title = prompt("提案のタイトルを入力してください(50文字以内)");

  if(title === null) return;
  if(title.length > 50) return alert("50文字以内で入力してください");
  // const content = prompt("提案内容を入力してください");
  let proposer = prompt("提案者（任意）");
  if(proposer.length > 20) return alert("20文字以内で入力してください");

  const signMsgData = {
    address: address,
    type: 'proposal'
  };

  fetch("http://127.0.0.1:5001/nouns-jp-vote/us-central1/getNonceToSign", {
    method: 'POST',
    body: JSON.stringify(signMsgData),
    headers: {'Content-Type': 'application/json'}
  })
  .then(res => resdata = res.json())
  .then(json => console.log(json))
  .catch(err => console.error('error:' + err));

  // メッセージを署名
  const signature = await signer.signMessage(resdata.message);

  const postPropData = {
    address: address,
    signature: signature,
    title: title,
    proposer: proposer
  };

  fetch("http://127.0.0.1:5001/nouns-jp-vote/us-central1/postProposal", {
    method: 'POST',
    body: JSON.stringify(postPropData),
    headers: {'Content-Type': 'application/json'}
  })
  .catch(err => console.error('error:' + err));
};

//提案編集 (functions未対応)
// export const handleEdit = async (id, address) => {
//   const title = prompt("提案のタイトルを入力してください(50文字以内)");
//   if(title === null) return;
//   if(title.length > 50) return alert("50文字以内で入力してください");
//   // const content = prompt("提案内容を入力してください");
//   const proposer = prompt("提案者（任意）");
//   if(proposer === null) return;
//   if(proposer.length > 20) return alert("20文字以内で入力してください");
//   const docRef = doc(db, "proposals", id);
//   const payload = {
//     title: title,
//     proposer: proposer,
//   };
//   const docSnap = await getDoc(docRef);
//   const proposerAddress = docSnap.data().address;

//   if (address === proposerAddress) {
//     await updateDoc(docRef, payload);
//   } else {
//     alert("提案者のみ編集出来ます");
//   }
// };

//提案の削除 (functions未対応)
// export const handleDelete = async (id, address) => {
//   const docRef = doc(db, "proposals", id);
//   const docSnap = await getDoc(docRef);
//   const proposerAddress = docSnap.data().address;
//   if (address === proposerAddress) {
//     await deleteDoc(docRef);
//   } else {
//     alert("提案者のみ削除出来ます");
//   }
// };

//投票(保有数 = 投票可能回数)
export const handleVote = async (address, signer, id, count) => {
  const signMsgData = {
    address: address,
    type: 'proposal'
  };

  fetch("http://127.0.0.1:5001/nouns-jp-vote/us-central1/getNonceToSign", {
    method: 'POST',
    body: JSON.stringify(signMsgData),
    headers: {'Content-Type': 'application/json'}
  })
  .then(res => resdata = res.json())
  .then(json => console.log(json))
  .catch(err => console.error('error:' + err));

  // メッセージを署名
  const signature = await signer.signMessage(resdata.message);

  const votePropData = {
    address: address,
    signature: signature,
    id: id,
    count: count
  };

  fetch("http://127.0.0.1:5001/nouns-jp-vote/us-central1/handleVote", {
    method: 'POST',
    body: JSON.stringify(votePropData),
    headers: {'Content-Type': 'application/json'}
  })
  .then(res => resdata = res.json())
  .then(json => console.log(json))
  .catch(err => console.error('error:' + err));

  alert(resdata.message);
};

//投票（重みなしver）
// export const handleVote = async (id, address) => {
//   const docRef = doc(db, "proposals", id);
//   const payload = { count: increment(1), [address]: true };

//   //フラグ
//   const docSnap = await getDoc(docRef);
//   const snapShot = docSnap.data();
//   const votedAddrFlg = snapShot[address];
//   console.log(votedAddrFlg)
//   if(votedAddrFlg) {
//     alert("投票済みです");
//   } else {
//   await updateDoc(docRef, payload);
//   }
// };

//一括削除機能
// export const handleQueryDelete = async (id) => {
//   const userInputName = prompt("");
//   const collectionRef = collection(db, "proposals");
//   const q = query(collectionRef, where("name", "==", userInputName));
//   const snapshot = await getDocs(q);
//   const results = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
//   results.forEach(async (result) => {
//     const docRef = doc(db, "food", result.id);
//     await deleteDoc(docRef);
//   });
// };

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
export const handleNew = async (address) => {
  const count = 0;
  const title = prompt("提案のタイトルを入力してください(50文字以内)");
  if(title === null) return;
  if(title.length > 50) return alert("50文字以内で入力してください");
  // const content = prompt("提案内容を入力してください");
  let proposer = prompt("提案者（任意）");
  if(proposer.length > 20) return alert("20文字以内で入力してください");
  const proposerAddress = address;

  const collectionRef = collection(db, "proposals");
  const payload = {
    title: title,
    proposer: proposer,
    timestamp: serverTimestamp(),
    count: count,
    address: proposerAddress,
  };
  const docRef = await addDoc(collectionRef, payload);
  console.log(`The new id is: ${docRef.id}`);
};

//提案編集
export const handleEdit = async (id, address) => {
  const title = prompt("提案のタイトルを入力してください(50文字以内)");
  if(title === null) return;
  if(title.length > 50) return alert("50文字以内で入力してください");
  // const content = prompt("提案内容を入力してください");
  const proposer = prompt("提案者（任意）");
  if(proposer === null) return;
  if(proposer.length > 20) return alert("20文字以内で入力してください");
  const docRef = doc(db, "proposals", id);
  const payload = {
    title: title,
    proposer: proposer,
  };
  const docSnap = await getDoc(docRef);
  const proposerAddress = docSnap.data().address;

  if (address === proposerAddress) {
    await updateDoc(docRef, payload);
  } else {
    alert("提案者のみ削除出来ます");
  }
};

//提案の削除
export const handleDelete = async (id, address) => {
  const docRef = doc(db, "proposals", id);
  const docSnap = await getDoc(docRef);
  const proposerAddress = docSnap.data().address;
  if (address === proposerAddress) {
    await deleteDoc(docRef);
  } else {
    alert("提案者のみ削除出来ます");
  }
};

//投票(保有数 = 投票可能回数)
export const handleVote = async (id, address, count) => {
  const docRef = doc(db, "proposals", id);
  const docSnap = await getDoc(docRef);
  const snapShot = docSnap.data();
  const votedAddrFlg = snapShot[address];
  let payload;
  if(votedAddrFlg === undefined) {
    payload = { count: increment(1), [address]: increment(count -1) };
    console.log(`この投票を含まない投票可能回数: ${count}`);

  } else if (votedAddrFlg > 0) {
    payload = { count: increment(1), [address]: increment(-1) };
    console.log(`この投票を含まない投票可能回数: ${votedAddrFlg}`);
  }
  
  if(votedAddrFlg === 0) {
    alert("投票済みです");
  } else {
  await updateDoc(docRef, payload);
  }
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

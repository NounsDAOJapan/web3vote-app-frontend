const functions = require("firebase-functions");
const firebaseAdmin = require("firebase-admin/app");
const corsLib = require("cors");
const randomUUID = require("crypto");
const ethers = require("ethers");

const SignMessageTable = {
  "proposal" : "Proposals will be made based on the information entered.\n\nNonce : ",
  "vote" : "Vote for the designated proposal.\n\nNonce : "
}

const NFTAddress = "0x898a7dBFdDf13962dF089FBC8F069Fa7CE92cDBb"; //NounsDAO JAPAN pfp

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

const admin = firebaseAdmin.initializeApp();
const cors = corsLib({
  origin: true,
});

exports.getNonceToSign = functions.https.onRequest((request, response) =>
  cors(request, response, async () => {
    try {
      if (request.method !== "POST") {
        return response.sendStatus(405);
      }
      if (!request.body.address || !request.body.type || !(request.body.type in SignMessageTable) ) {
        return response.sendStatus(400);
      }
      // Get the user document for that address
      const userDoc = await admin
          .firestore()
          .collection("users")
          .doc(request.body.address)
          .get();
      if (userDoc.exists) {
        // The user document exists already, so just return the nonce
        const existingNonce = userDoc.data()?.nonce;
        return response.status(200).json({nonce: existingNonce});
      } else {
        // The user document does not exist, create it first
        const generatedNonce = randomUUID(); // 元記事の Math.random() * 1000000 から変更
        // Create an Auth user
        const createdUser = await admin.auth().createUser({
          uid: request.body.address,
        });
        // Associate the nonce with that user
        await admin.firestore().collection("users").doc(createdUser.uid).set({
          nonce: generatedNonce,          
        });
        return response.status(200).json({message: SignMessageTable[request.body.type] + generatedNonce});
      }
    } catch (err) {
      console.log(err);
      return response.sendStatus(500);
    }
  })
);

const verifySignedMessage = async (address, signature, type, response) => {
  try {
    // Get the nonce for this address
    const userDoc = await admin
        .firestore()
        .collection("users")
        .doc(address)
        .get();
    if (userDoc.exists) {
      const existingNonce = userDoc.data()?.nonce;
      // Recover the address of the account
      // used to create the given Ethereum signature.
      const digest = ethers.utils.hashMessage(SignMessageTable[type] + existingNonce)
      const recoveredAddress = ethers.utils.recoverAddress(digest, signature)
      // See if that matches the address
      // the user is claiming the signature is from
      if (recoveredAddress === address) {
      // The signature was verified - update the nonce to prevent replay attacks
      // update nonce
        await userDocRef.update({
          nonce: randomUUID(),
        });
        // Return the token
        return response.status(200);
      } else {
      // The signature could not be verified
        return response.status(401);
      }
    } else {
      console.log("user doc does not exist");
      return response.status(500);
    }
  } catch (err) {
    console.log(err);
    return response.status(500);
  }
};

// const toHex = (stringToConvert) =>
// stringToConvert
//     .split("")
//     .map((c) => c.charCodeAt(0).toString(16).padStart(2, "0"))
//     .join("");

//提案作成
exports.postProposal = functions.https.onRequest(
  (request, response) =>
    cors(request, response, async () => {
      try {
        if (request.method !== "POST") {
          return response.sendStatus(405);
        }
        if (!request.body.address || !request.body.signature || !request.body.title || !request.body.proposer ) {
          return response.sendStatus(400);
        }
        const title = request.body.title;
        const proposer = request.body.proposer;
        const proposerAddress = request.body.address;
        if(title.length > 50) return response.sendStatus(400);
        if(proposer.length > 20) return response.sendStatus(400);
        // 署名による本人確認
        response = verifySignedMessage(proposerAddress, request.body.signature, "proposal", response);
        if ( response.statusCode != 200 ) {
          return response.sendStatus(response.statusCode);
        }

        const collectionRef = admin.firestore().collection("proposals");
        const payload = {
          title: title,
          proposer: proposer,
          timestamp: serverTimestamp(),
          count: 0,
          address: proposerAddress,
        };
        const docRef = await addDoc(collectionRef, payload);
        console.log(`The new id is: ${docRef.id}`);
      } catch (err) {
        console.log(err);
        return response.sendStatus(500);
      }
    })
);

const getHoldNFTNum = async (owneraddress) => {
  const providerUrl = 'https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID';
  const provider = new ethers.providers.JsonRpcProvider(providerUrl);

  const accountAddress = owneraddress;
  const contractAddress = NFTAddress;

  // ERC-721コントラクトのABI定義
  const minABI = [
    // balanceOf
    {
      constant: true,
      inputs: [{name: 'owner', type: 'address'}],
      name: 'balanceOf',
      outputs: [{name: '', type: 'uint256'}],
      type: 'function'
    }
  ];

  // コントラクトインスタンスの生成
  const contract = new ethers.Contract(contractAddress, minABI, provider);

  try {
    // balanceOf関数を実行してNFTの数を取得
    const balance = await contract.balanceOf(accountAddress);
    return balance;
  } catch (error) {
    console.error(error);
    return 0;
  }
};

//投票(保有数 = 投票可能回数)
exports.handleVote = functions.https.onRequest(
  (request, response) =>
    cors(request, response, async () => {
      try {
        if (request.method !== "POST") {
          return response.sendStatus(405);
        }
        if (!request.body.address || !request.body.signature || !request.body.id || !request.body.count ) {
          return response.sendStatus(400);
        }
        const id = request.body.id;
        const voterAddress = request.body.address;
        const count = request.body.count;
        // 署名による本人確認
        response = verifySignedMessage(voterAddress, request.body.signature, "vote", response);
        if ( response.statusCode != 200 ) {
          return response.sendStatus(response.statusCode);
        }
        // NFT所持数チェック
        const nftnum = getHoldNFTNum(voterAddress);
        if ( nftnum < count ) {
          return response.sendStatus(400);
        }
        // 投票処理
        const collectionRef = admin.firestore().collection("proposals");
        const docRef = collectionRef.doc(id);
        const docSnap = await getDoc(docRef);
        const snapShot = docSnap.data();
        const votedAddrFlg = snapShot[voterAddress];
        let payload;
        if(votedAddrFlg === undefined) {
          payload = { count: increment(1), [voterAddress]: increment(count -1) };
          resmessage = `この投票を含まない投票可能回数: ${count}`;
          console.log(resmessage);
        } else if (votedAddrFlg > 0) {
          payload = { count: increment(1), [voterAddress]: increment(-1) };
          resmessage = `この投票を含まない投票可能回数: ${votedAddrFlg}`;
          console.log(resmessage);
        }
        
        if(votedAddrFlg === 0) {
          console.log("投票済みです");
          return response.status(200).json({message: "投票済みです"});
        } else {
          await updateDoc(docRef, payload);
          return response.status(200).json({message: "投票完了しました"});
        }
      } catch (err) {
        console.log(err);
        return response.status(500);
      }
    }
  )
);

# テスト用オンチェーンNFTのコントラクトと投票システム

### 足りない機能  

・ウェブデザイン  
・本人確認（秘密鍵を使った電子署名）
・提案内容の個別ページの自動生成機能  
・提案の際に対象となるNFTのコントラクトアドレスを追加する機能  
  →投票の際に対象となるNFTを保持しているか判定する機能  
・不正票を防止する機能(現在は投票の際DBにアドレスを格納、判定に使用)  
・提案〜判定までのライフサイクル  

### あると良さそうな機能  

・提案を修正する機能（NFTの追加など）  
・投票結果順位付け  

[デモページ](https://nouns-jp-vote.web.app/)  

### ~~投票用NFT~~

~~ミントページを作っていないので、直コンしてください。~~  

現在NounsDAO JAPAN pfpが投票権になっています（9/11）

ネットワーク: Rinkeby testnet  

Faucet: <https://rinkebyfaucet.com/>  

コントラクト: [0xd04A00132154527B87DaaF2154e4565C17Cb7914](https://rinkeby.etherscan.io/address/0xd04A00132154527B87DaaF2154e4565C17Cb7914)  

![直コン解説](https://github.com/Itodai/web3vote-app/blob/main/howtomint.png)  

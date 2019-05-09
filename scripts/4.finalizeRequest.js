// load web3
const Web3 = require('web3');
const httpProviderUrl = "http://172.30.0.3:8545"; // Rootchain RPC endpoint
const web3 = new Web3(new Web3.providers.HttpProvider(httpProviderUrl));
const operator = web3.eth.accounts[0] 
const user = web3.eth.accounts[1];

// RootChain instance
const fs = require('fs');
const path = require('path');

const rootchainJSON = path.join(__dirname, '..', 'build', 'RootChain.json');
const rootchainABI = JSON.parse(fs.readFileSync(rootchainJSON).toString()).abi;
const root = web3.eth.contract(rootchainABI).at("0x9A684a15a9e634Dabe7a1f68B6074d95AaB62298");

// Mintable Token
const tokenABIFile = path.join(__dirname, '..', 'build', 'MintableToken.json');
const tokenABI = JSON.parse(fs.readFileSync(tokenABIFile).toString()).abi;
const token = web3.eth.contract(tokenABI).at("0x96b782BCb9479c7550Fd86d411c285BFE4319b72");

// wrapper contract
const wrapperABIFile = path.join(__dirname, '..', 'build', 'RequestableWrapperToken.abi');
const wrapperABI = JSON.parse(fs.readFileSync(wrapperABIFile).toString());
const rootWrapper = web3.eth.contract(wrapperABI).at("0x1d93d7bd7d820ac7691109ace371e42d5004e1c1");

// wrapper contract in plasma chain
const plsWrapperAddr = '0xe91b085dde42ec2a702a0bbd430ba8afbfadf103';

const REVERT = '0x0';

// helper function
const { 
  waitTx,
} = require('./helper');


(async () => {
    // use bluebird
    const Promise = require('bluebird');
    Promise.promisifyAll(web3.eth, { suffix: 'Async' });
    Promise.promisifyAll(token, { suffix: 'Async' });
    Promise.promisifyAll(rootWrapper, { suffix: 'Async' });
    Promise.promisifyAll(root, { suffix: 'Async' });
    let txHash;
  
    try {
        const lastFinalizedBlock = await root.getLastFinalizedBlock(0);
        const lastBlock = await root.lastBlock(0);
        console.log(lastFinalizedBlock)
        console.log(lastBlock)
        console.log(lastBlock - lastFinalizedBlock)
        let needBlock = lastBlock - lastFinalizedBlock;
        async function finalizeBLK(){
          txHash = await root.finalizeBlock({from: user, gas: 100000});
          await waitTx(web3, txHash);
        }
        if (needBlock > 0){
          for(let i = 0; i < needBlock; i++){
            return await finalizeBLK();
          }
        }

        txHash = await root.finalizeRequest({from: user, gas: 200000});
        await waitTx(web3, txHash);

    } catch (error) {
        console.log(error)
    }
})();

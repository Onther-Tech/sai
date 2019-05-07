// load web3
const Web3 = require('web3');
const httpProviderUrl = "http://172.30.0.3:8545"; // Rootchain RPC endpoint
const web3 = new Web3(new Web3.providers.HttpProvider(httpProviderUrl));
const operator = web3.eth.accounts[0] // "0x71562b71999873DB5b286dF957af199Ec94617F7"
const user = web3.eth.accounts[1];

// RootChain instace
const fs = require('fs');
const path = require('path');
// 기준 경로는 plasma-evm-contracts/scripts 에 작성된 파일.
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

// helper function
const { 
    padLeft,
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
        const trieKey = await rootWrapper.getBalanceTrieKey(user, {from: user});
        console.log("User's TrieKey : " , trieKey);
        let trieValue = await padLeft(web3, web3.fromDecimal(1e19));
        console.log("User's TrieValue : ", trieValue);
        txHash = await root.startExit(rootWrapper.address, trieKey, trieValue, {from: user, gas: 2000000, value: web3.toWei('0.001', 'ether')});
        await waitTx(web3, txHash);
        
    } catch (error) {
        console.log(error)
    }
})();






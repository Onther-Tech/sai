// load web3
const Web3 = require('web3');
const httpProviderUrl = "http://localhost:8545"; // Rootchain RPC endpoint
const web3 = new Web3(new Web3.providers.HttpProvider(httpProviderUrl));
const operator = web3.eth.accounts[0] // "0x71562b71999873DB5b286dF957af199Ec94617F7"
const user = web3.eth.accounts[1];

// RootChain instace
const fs = require('fs');
const path = require('path');
// 기준 경로는 plasma-evm-contracts/scripts 에 작성된 파일.
const rootchainJSON = path.join(__dirname, '..', 'build', 'RootChain.json');
const rootchainABI = JSON.parse(fs.readFileSync(rootchainJSON).toString()).abi;
const root = web3.eth.contract(rootchainABI).at("0x880ec53af800b5cd051531672ef4fc4de233bd5d");

// Mintable Token
const tokenABIFile = path.join(__dirname, '..', 'build', 'MintableToken.json');
const tokenABI = JSON.parse(fs.readFileSync(tokenABIFile).toString()).abi;
const token = web3.eth.contract(tokenABI).at("0x3A220f351252089D385b29beca14e27F204c296A");

// wrapper contract
const wrapperABIFile = path.join(__dirname, '..', 'build', 'RequestableWrapperToken.abi');
const wrapperABI = JSON.parse(fs.readFileSync(wrapperABIFile).toString());
const rootWrapper = web3.eth.contract(wrapperABI).at("0x1d93d7bd7d820ac7691109ace371e42d5004e1c1");

// wrapper contract in plasma chain
const plsWrapperAddr = '0xbcbe8c344294bba0b1445c92c211a876b154976a';

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
        txHash = await token.mint(user, 1e19, {from: operator});
        await waitTx(web3, txHash);
        txHash = await token.approve(rootWrapper.address, 1e19, {from: user});
        await waitTx(web3, txHash);
        txHash = await rootWrapper.init(root.address, {from: user});
        await waitTx(web3, txHash);
        txHash = await rootWrapper.deposit(1e19, {from: user, gas: 1000000});
        await waitTx(web3, txHash);
        txHash = await root.mapRequestableContractByOperator(rootWrapper.address, plsWrapperAddr, {from: operator});
        await waitTx(web3, txHash);
        const trieKey = await rootWrapper.getBalanceTrieKey(user, {from: user});
        console.log(trieKey);
        let trieValue = await padLeft(web3, web3.fromDecimal(5e18));
        console.log(trieValue);
        txHash = await root.startEnter(rootWrapper.address, trieKey, trieValue, {from: user, gas: 2000000});
        await waitTx(web3, txHash);
        txHash = await root.startEnter(rootWrapper.address, trieKey, trieValue, {from: user, gas: 2000000});
        await waitTx(web3, txHash);
    } catch (error) {
        console.log(error)
    }
})();






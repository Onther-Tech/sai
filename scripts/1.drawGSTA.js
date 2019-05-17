// load web3
const Web3 = require('web3');
const httpProviderUrl = "http://127.0.0.1:8547"; // plasma chain RPC endpoint
const web3 = new Web3(new Web3.providers.HttpProvider(httpProviderUrl));
const operator = web3.eth.accounts[0]
const user = web3.eth.accounts[1];

const fs = require('fs');
const path = require('path');

// wrapper contract
const wrapperABIFile = path.join(__dirname, '..', 'build', 'RequestableWrapperToken.abi');
const wrapperABI = JSON.parse(fs.readFileSync(wrapperABIFile).toString());
const plsWrapper = web3.eth.contract(wrapperABI).at("0xe91b085dde42ec2a702a0bbd430ba8afbfadf103");

// tub contract
const TubABIFile = path.join(__dirname, '..', 'build', 'SaiTub.abi');
const TubABI = JSON.parse(fs.readFileSync(TubABIFile).toString());
const tub = web3.eth.contract(TubABI).at("0x230aa5d5550a10d90f165305f455fd404f904b3c");

// GSTA
const GSTAABIFile = path.join(__dirname, '..', 'build', 'RequestableToken.abi');
const GSTAABI = JSON.parse(fs.readFileSync(GSTAABIFile).toString());
const gsta = web3.eth.contract(GSTAABI).at("0x25b0aae16b929da9b72f56e271344cb1734ebda5");

// pip contract
const PipABIFile = path.join(__dirname, '..', 'build', 'DSValue.abi');
const PipABI = JSON.parse(fs.readFileSync(PipABIFile).toString());
const pip = web3.eth.contract(PipABI).at("0x2747fbbab18edf8d0cec77e9ccba14708b87a46b");

// helper function
const {
    padLeft,
    waitTx,
 } = require('./helper');

(async () => {
    // use bluebird
    const Promise = require('bluebird');
    Promise.promisifyAll(web3.eth, { suffix: 'Async' });
    Promise.promisifyAll(tub, { suffix: 'Async' });
    Promise.promisifyAll(plsWrapper, { suffix: 'Async' });
    Promise.promisifyAll(gsta, { suffix: 'Async' });
    let txHash;

    try {
        txHash = await tub.open({from: user});
        await waitTx(web3, txHash);
        // const receipt = await web3.eth.getTransactionReceipt(txHash);
        // const cdpNumber = receipt.logs[1].data;

        const cdpNumber = await padLeft(web3, web3.fromDecimal(1));
        txHash = await tub.join(1e18, {from: user, gas: 2000000});
        await waitTx(web3, txHash);
	      console.log("Join 1e18 RBG : ", txHash);

        txHash = await tub.lock(cdpNumber, 1e18, {from: user, gas: 2000000});
        await waitTx(web3, txHash);
	      console.log("Lock 1e18 PRBG : ", txHash);

        txHash = await tub.draw(cdpNumber, 266.6e18, {from: user, gas: 2000000});
        await waitTx(web3, txHash);
	      console.log("Draw 266.6e18(limit) GSTA :", txHash);
        
        const bal = await gsta.balanceOf(user);
        console.log("USER's GSTA balance : ", bal);

    } catch (error) {
        console.log(error)
    }
})();

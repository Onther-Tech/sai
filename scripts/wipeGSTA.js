// load web3
const Web3 = require('web3');
const httpProviderUrl = "http://localhost:8547"; // Rootchain RPC endpoint
const web3 = new Web3(new Web3.providers.HttpProvider(httpProviderUrl));
const operator = web3.eth.accounts[0] // "0x71562b71999873DB5b286dF957af199Ec94617F7"
const user = web3.eth.accounts[1];

// RootChain instace
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
        const cdpNumber = await padLeft(web3, web3.fromDecimal(1));
        txHash = await tub.wipe(cdpNumber, 1e19, {from: user, gas: 2000000});
        await waitTx(web3, txHash);
        txHash = await tub.free(cdpNumber, 1e19, {from: user, gas: 2000000});
        await waitTx(web3, txHash);
        txHash = await tub.exit(1e19, {from: user, gas: 2000000});
        await waitTx(web3, txHash);
        const gstaBal = await gsta.balanceOf(user);
        console.log(gstaBal);
        const rbgBal = await plsWrapper.balanceOf(user);
        console.log(rbgBal);

    } catch (error) {
        console.log(error);
    }
})();

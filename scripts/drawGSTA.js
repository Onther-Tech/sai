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
const plsWrapper = web3.eth.contract(wrapperABI).at("0xbcbe8c344294bba0b1445c92c211a876b154976a");

// tub contract
const TubABIFile = path.join(__dirname, '..', 'out', 'SaiTub.abi');
const TubABI = JSON.parse(fs.readFileSync(TubABIFile).toString());
const tub = web3.eth.contract(TubABI).at("0xe4cd5820eba71ea89612f094833a60ebf22f59eb");

// GSTA 
const GSTAABIFile = path.join(__dirname, '..', 'out', 'RequestableToken.abi');
const GSTAABI = JSON.parse(fs.readFileSync(GSTAABIFile).toString());
const gsta = web3.eth.contract(GSTAABI).at("0x8a91970dff486a2a96d9f858c21ea596bdfdc92a");

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
        await waitTx(txHash);
        txHash = await tub.join(1e19, {from: user});
        await waitTx(txHash);
        let cdpNumber = await padLeft(web3, web3.fromDecimal(1));
        txHash = await tub.lock(cdpNumber, 1e19, {from: user});
        await waitTx(txHash);
        txHash = await tub.draw(cdpNumber, 1e19, {from: user});
        await waitTx(txHash);
        const bal = await gsta.balanceOf(user);
        console.log(bal);
        
    } catch (error) {
        console.log(error)
    }
})();






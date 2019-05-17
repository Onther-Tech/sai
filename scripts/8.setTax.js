const fs = require('fs');
const path = require('path');

// load web3
const Web3 = require('web3');
const httpProviderUrl = "http://127.0.0.1:8547"; // plasma chain RPC endpoint
const web3 = new Web3(new Web3.providers.HttpProvider(httpProviderUrl));
const operator = web3.eth.accounts[0]
const user = web3.eth.accounts[1];

// tub contract
const TubABIFile = path.join(__dirname, '..', 'build', 'SaiTub.abi');
const TubABI = JSON.parse(fs.readFileSync(TubABIFile).toString());
const tub = web3.eth.contract(TubABI).at("0x230aa5d5550a10d90f165305f455fd404f904b3c");

// mom contract
const momABIFile = path.join(__dirname, '..', 'build', 'SaiMom.abi');
const momABI = JSON.parse(fs.readFileSync(momABIFile).toString());
const mom = web3.eth.contract(momABI).at("0x7c06913b894c3858945f227c875e7189bda9951f");

// helper function
const {
    padLeft,
    waitTx,
 } = require('./helper');

(async () => {
    // use bluebird
    const Promise = require('bluebird');
    Promise.promisifyAll(web3.eth, { suffix: 'Async' });
    Promise.promisifyAll(mom, { suffix: 'Async' });

    let txHash;

    try {

      txHash = await mom.setTax(1.000001e27, {from: user, gas: 200000})
      await waitTx(web3, txHash);

      const tax = await tub.tax();
      console.log("Stability fee rate : ", tax);

    } catch (error) {
        console.log(error);
    }
})();

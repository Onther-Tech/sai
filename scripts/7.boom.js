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

// tap contract
const TapABIFile = path.join(__dirname, '..', 'build', 'SaiTap.abi');
const TapABI = JSON.parse(fs.readFileSync(TapABIFile).toString());
const tap = web3.eth.contract(TapABI).at("0x3b66dbf9b260219efc1a292573f31bf061f29624");

// prbg contract
const PRBGABIFile = path.join(__dirname, '..', 'build', 'DSToken.abi');
const PRBGABI = JSON.parse(fs.readFileSync(PRBGABIFile).toString());
const prbg = web3.eth.contract(PRBGABI).at("0x39c2cc175ad39d1a0d1a2270235a6d069955ff66");

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
    Promise.promisifyAll(pip, { suffix: 'Async' });

    let txHash;

    try {
      let joy = await tap.joy();
      console.log("Tap GSTA Balance: ", joy);

      let woe = await tap.woe();
      console.log("Tap sin Balance: ", woe);

      let fog = await tap.fog();
      console.log("Tap prbg Balance: ", fog);
      console.log('--------------------');

      txHash = await tap.boom(1e18, {from: user, gas: 200000})
      await waitTx(web3, txHash);

      joy = await tap.joy();
      console.log("Tap GSTA Balance: ", joy);

      woe = await tap.woe();
      console.log("Tap sin Balance: ", woe);

      fog = await tap.fog();
      console.log("Tap prbg Balance: ", fog);
      console.log('--------------------');

      const prbgBal = await prbg.balanceOf(user);
      console.log("User PRBG Balance : ", prbgBal);

      const gstaBal = await gsta.balanceOf(user);
      console.log("User GSTA Balance : ", gstaBal);


    } catch (error) {
        console.log(error);
    }
})();

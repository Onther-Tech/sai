require("dotenv").config();

const http = require("http");
const path = require("path");
const fs = require("fs");

const Tx = require("ethereumjs-tx");

const Uint256 = require("uint256");

// import { utils as ethersUtils } from 'ethers';
const ethers = require("ethers");
const Web3 = require("web3");
const BigNumber = require("bignumber.js")
const express = require("express");
const httpProviderUrl = "http://127.0.0.1:8545";
const wsProviderUrl = "ws://127.0.0.1:8546";

const wsProvider = new Web3.providers.WebsocketProvider(wsProviderUrl);

const web3 = new Web3(new Web3.providers.HttpProvider(httpProviderUrl));

const ether = n => new BigNumber(n * 1e18);

function getParameterFromReq(req) {
  const input_values = {
    // from: req.body.from,
    func_name: req.body.func_name,
    value: req.body.value
  };
  return input_values;
}

const app = express();

app.post('/sai/:address', async(req, res, next) => {
  const abiPath = path.join(__dirname, '..', 'out', 'SaiTub.abi');
  const abi = JSON.parse(fs.readFileSync(abiPath).toString());

  const addressPath = path.join(__dirname, '..', 'out', 'address.json');
  // console.log(addressPath)
  // const addresses = JSON.parse(fs.readFileSync(addressPath).toString()).SAI_TUB;
  const address = "0x72c53d2f3e80f6da193e6c54f7d386033f34c4ff"

  const privateKey = new Buffer('474beb999fed1b3af2ea048f963833c686a0fba05f5724cb6417cf3b8ee9697e', 'hex')

  const contract = new web3.eth.Contract(abi, address);

  // const func_name = req.body.func_name;
  // const values = Object.values(req.body.params);
  
  
  // const from = parameter.from;

  const from = req.params.address;
  // console.log(from.length);

  // const byte_from = stringToBytes32(from);
  let nonce;
  try {
    nonce = await web3.eth.getTransactionCount(from);
  } catch (err) {
    return res.status(400).json({
      code: 1,
      message: err.message,
    });
  }

  const method = 'join';
  const value = new Buffer('10000000000000000', 'hex')
  console.log(value)
  const values = {'_wad': value};

  let bytecode;
  bytecode = getBytecode(web3, abi, method, values);
  
  try{
    bytecode = getBytecode(web3, abi, method, values);
    
  } catch(err) {
    return res.status(400).json({
      code: 2,
      message: err.message,
    });
  }
  
  // const values = Object.values(req.body.params);

  // ToDo: 파라미터 상태 체크하는 과정 필요

  let gas;
  try {
    gas = await contract.methods.join(value).estimateGas({
      from: from,
    });
  } catch (err) {
    return res.status(400).json({
      code: 3,
      message: err.message,
    });
  }
  const rawTx = {
    nonce: nonce,
    chainId: await web3.eth.net.getId(),
    data: bytecode,
    gasPrice: '22e9',
    gas: parseInt(gas * 1.2),
  };

  const tx = new Tx(rawTx);
  tx.sign(privateKey);
  const serializedTx = tx.serialize().toString('hex');

  try {
    web3.eth.sendSignedTransaction('0x' + serializedTx)
    .on('receipt', receipt => {
      return res.status(200).json({
        code: 0,
        message: 'success',
        response: {
          txhash: receipt.transactionHash,
        }
      });
    }).on('error', error => {
      return res.status(400).json({
        code: 5,
        message: error.message,
      });
    });
  } catch (err) {
    return res.status(400).json({
      code: 6,
      message: err.message,
    });
  }
});


app.listen(8080, async () => {
  console.log("Express listening 8080");
});

function stringToBytes32(text) {
  var data = ethers.utils.toUtf8Bytes(text);
  if (data.length > 42) {
    throw new Error('too long');
  }
  data = ethers.utils.padZeros(data, 42);
  return ethers.utils.hexlify(data);
}


function getBytecode(web3, abi, methodName, params) {
  let method;
  for (let i = 0; i < abi.length; i++) {
    if (abi[i].name == methodName) {
      method = abi[i];
      break;
    }
  }

  const functionSelector = web3.eth.abi.encodeFunctionSignature(method);
  const types = [];
  for (let i = 0; i < method.inputs.length; i++) {
    types.push(method.inputs[i].type);
  }
  
  const values = Object.values(params);
  
  const encodeParamters = web3.eth.abi.encodeParameters(types, values).slice(2);
  const bytecode = functionSelector.concat(encodeParamters);
  return bytecode;
}

async function getValue(web3, contract, name) {
  const result = await contract.methods[name]().call();
  return result;
}
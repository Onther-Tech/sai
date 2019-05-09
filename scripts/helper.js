const REVERT = '0x0';
const DEFAULT_PAD_LENGTH = 2 * 32;

function marshalString (str) {
    if (str.slice(0, 2) === '0x') return str;
    return '0x'.concat(str);
  }
  
function unmarshalString (str) {
    if (str.slice(0, 2) === '0x') return str.slice(2);
    return str;
}

async function padLeft (web3, str, padLength = DEFAULT_PAD_LENGTH) {
    const v = web3.toHex(str);
    return marshalString(web3.padLeft(unmarshalString(v), padLength));
}

async function waitTx (web3, hash) {
    let receipt;
    
    while (true) {
      receipt = await web3.eth.getTransactionReceiptAsync(hash);
      if (receipt) break;
      await wait(1);
    }
  
    if (receipt.status === REVERT) {
      console.error(`transaction(${hash}) is reverted`);
      return false;
    }
    if (receipt.contractAddress) {
      return receipt.contractAddress;
    } else {
      return receipt.transactionHash;
    }
}

function wait (sec) {
return new Promise(resolve => {
    setTimeout(() => {
    resolve();
    }, sec * 1000);
});
}
module.exports = {
  marshalString,
  unmarshalString,
  padLeft,
  waitTx,
  wait
};

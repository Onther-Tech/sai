#!/bin/bash
set -ex

if [ -z "$1" ]]||[ -z "$2" ]||[ -z "$3" ]||[ -z "$4" ];
then
  echo "[Usage] setup_chain [RootChain address] [MintableToken address] [Operator Address] [User Address]" && exit 1
else

  export ETH_GAS=${ETH_GAS:-"4700000"}
  export SETH_STATUS=yes
  export ETH_RPC_ACCOUNTS=yes # Don't use ethsign
  export ETH_RPC_URL=http://127.0.0.1:8547
  export USER=$4
  export OPER=$3
  export ROOT_CHAIN=$1
  export ETH_FROM=$USER
  echo "ETH Gas limit : " $ETH_GAS
  echo "SETH set Coinbase as : " $ETH_FROM
  echo "Deploy Sai-fab contract ... "
  bash bin/deploy-fab $1
  source load-fab-unknown
  echo "Deploy makerDao contract ..."
  bash bin/deploy-rbg $1 #0x9A684a15a9e634Dabe7a1f68B6074d95AaB62298
  source load-env-unknown

  ###################################################
  ## Deploying Rootchain contract
  ##
  echo "Change endpoint to rootchain"
  export ETH_RPC_URL=http://127.0.0.1:8545
  echo "Change ETH_FROM to Operator"
  export ETH_FROM=$OPER
  echo "Deploy GSTA token at rootchain"
  ROOT_GSTA=$(dapp create RequestableToken $(seth --to-bytes32 $(seth --from-ascii 'GSTA')) $ROOT_CHAIN)
  echo "Token Mapping GSTA(root) - GSTA(child)"
  #seth send $ROOT_CHAIN "mapRequestableContractByOperator(address,address)" $ROOT_GSTA $PLS_GSTAR

  ################################################
  ## RootChain Wrapper Token Operating parts
  ##
  echo "Change to User Account at rootchain"
  export ETH_FROM=$USER
  MINTABLE_TOKEN=$2
  ROOT_RBG_WR=$(dapp create RequestableWrapperToken false 0x$(seth --to-bytes32 $(seth --from-ascii 'wRBG')) $MINTABLE_TOKEN) #MintableToken addr instead RBG
  #seth send $ROOT_RBG_WR "init(address)" $ROOT_CHAIN
fi

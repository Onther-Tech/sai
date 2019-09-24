#!/bin/bash
export NETWORK=plasma
export NETWORK_NO=16

#function deploy_contract() {
#	cd ./requestable-erc20-wrapper-token
#	npm run pls_deploy:mintable:burnable 
#	cd -
#}

if [ -d "./requestable-erc20-wrapper-token" ]; then
	echo "requestable-erc20-wrapper-token contract has"
	cd ./requestable-erc20-wrapper-token
else
	echo "requestable-erc20-wrapper-token contract needs, start clone"
	git clone -b openzeppelinERC20 https://github.com/Onther-Tech/requestable-erc20-wrapper-token ./requestable-erc20-wrapper-token
	echo "Install npm packages"
	cd ./requestable-erc20-wrapper-token
	npm install
fi

echo "1.Deploy GSTA Token Contract"
# deploy_contract
MINTABLE=true BURNABLE=true eval 'npx truffle migrate --reset --network $NETWORK'

GSTA_ADDR=$(cat ./build/contracts/RequestableERC20MintableBurnableMock.json | jq .networks.\"${NETWORK_NO}\".address --raw-output)
echo "RequestableERC20 'GSTA' address : ${GSTA_ADDR}"

echo "2.Deploy BST Token Contract"
# deploy_contract $NETWORK
MINTABLE=true BURNABLE=true eval 'npx truffle migrate --reset --network $NETWORK'

BST_ADDR=$(cat ./build/contracts/RequestableERC20MintableBurnableMock.json | jq .networks.\"${NETWORK_NO}\".address --raw-output)
echo "RequestableERC20 'BST' address : ${BST_ADDR}"

echo "3.Deploy Wrapper Token contract"
echo "3.1.Wrapper Need Mintable Token"
if [ -z "$TOKEN" ]
then
	MINTABLE=true eval 'npx truffle migrate --reset --network $NETWORK'
	export TOKEN=$(cat ./build/contracts/RequestableERC20MintableMock.json | jq .networks.\"${NETWORK_NO}\".address --raw-output)
else
	echo "Already Wrapper base Token Address, skip this process"
fi


echo "3.2.Deploying Wrapper"
echo "- Wrapper Base Token Address : ${TOKEN}"
TOKEN=$TOKEN eval 'npx truffle migrate --reset --network $NETWORK'
WRAPPER_ADDR=$(cat ./build/contracts/RequestableERC20Wrapper.json | jq .networks.\"$NETWORK_NO\".address --raw-output)

echo "RequestableERC20Wrapper deployed : " $WRAPPER_ADDR

cat > ../load-token-addr << EOF
#!/bin/bash
# sai deployment from $(git rev-parse HEAD)
# $(date)
export PLS_RBG=$WRAPPER_ADDR
export PLS_GSTA=$GSTA_ADDR
export PLS_BST=$BST_ADDR
export PLS_MINTABLE=$TOKEN
EOF

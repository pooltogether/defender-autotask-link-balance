const { ethers } = require("ethers")
const { DefenderRelaySigner, DefenderRelayProvider } = require('defender-relay-client/lib/ethers');

const chainLinkTokenABI = require("../abis/chainlink")
const CHAINLINK_TOKEN_ADDRESS = "0x514910771af9ca656af840dff83e8264ecf986ca"

const BALANCE_THRESHOLD = await ethers.utils.parseEther("4")

exports.handler = async function(payload) {
  
    const provider = new DefenderRelayProvider(payload);
    const signer = new DefenderRelaySigner(payload, provider, { speed: 'fast' });
    
    const conditionRequest = payload.request.body;
  	const matches = [];
 	const events = conditionRequest.events;
  
  	for(const evt of events) {
		const prizeStrategyAddress = evt.matchReasons[0].params.from
        console.log("checking balance for ", prizeStrategyAddress)
      	
		const linkContract = new ethers.Contract(CHAINLINK_TOKEN_ADDRESS, chainLinkTokenABI, signer)
		
        const balance = await linkContract.balanceOf(prizeStrategyAddress)
        const decimalBalance = ethers.utils.formatUtils(balance, 18)
		console.log("BALANCE: ", decimalBalance)
        if(balance.lt(BALANCE_THRESHOLD)){
			console.log("low balance detected!") 
            
            // metadata can be any JSON-marshalable object (or undefined)
            matches.push({
               hash: evt.hash,
               metadata: {
                    "balance" : decimalBalance
               }
            });
        }
  	}
  
    return { matches }

}



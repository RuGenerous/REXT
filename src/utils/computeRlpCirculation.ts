import { JSBI, Token, TokenAmount } from '@rugenerous/sdk'
import { BigNumber } from 'ethers'


export function computeRugCirculation(
	rug: Token,
	blockTimestamp: BigNumber
): TokenAmount {
	let wholeAmount 


	return new TokenAmount(rug, JSBI.multiply(wholeAmount, JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(18))))
}
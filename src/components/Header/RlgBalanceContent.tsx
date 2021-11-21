import { TokenAmount, WAVAX, JSBI } from '@rugenerous/sdk'
import React, { useMemo, useState } from 'react'
import { X } from 'react-feather'
import styled from 'styled-components'
import tokenLogo from '../../assets/images/token-logo.rug'
import { injected } from '../../connectors'
import { RUG } from '../../constants'
import { useTotalSupply } from '../../data/TotalSupply'
import { useActiveWeb3React } from '../../hooks'
import { DOUBLE_SIDE_STAKING_REWARDS_CURRENT_VERSION, useTotalRugEarned } from '../../state/stake/hooks'
import { useAggregateRugBalance, useTokenBalance } from '../../state/wallet/hooks'
import { StyledInternalLink, TYPE, RugTokenAnimated } from '../../theme'
import { AutoColumn } from '../Column'
import { RowBetween } from '../Row'
import { Break, CardBGImage, CardNoise, CardSection, DataCard } from '../earn/styled'
import { usePair } from '../../data/Reserves'
import { useTranslation } from 'react-i18next'

const ContentWrapper = styled(AutoColumn)`
  width: 100%;
`

const ModalUpper = styled(DataCard)`
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  background: radial-gradient(76.02% 75.41% at 1.84% 0%, #f97316 0%, #e84142 100%);
  padding: 0.5rem;
`

const StyledClose = styled(X)`
  position: absolute;
  right: 16px;
  top: 16px;

  :hover {
    cursor: pointer;
  }
`
const AddRUG = styled.span`
  width: 100%;
  height: 100%;
  font-weight: 500;
  font-size: 32;
  padding: 4px 6px;
  align-items: center;
  text-align: center;
  background-color: ${({ theme }) => theme.bg3};
  background: radial-gradient(174.47% 188.91% at 1.84% 0%, #f97316 0%, #e84142 100%), #edeef2;
  border-radius: 12px;
  white-space: nowrap;
  cursor: pointer;

  :hover {
    opacity: 0.8;
  }
`

/**
 * Content for balance stats modal
 */
export default function RugBalanceContent({ setShowRugBalanceModal }: { setShowRugBalanceModal: any }) {
  const { account, chainId } = useActiveWeb3React()
  const rug = chainId ? RUG[chainId] : undefined

  const total = useAggregateRugBalance()
  const rugBalance: TokenAmount | undefined = useTokenBalance(account ?? undefined, rug)
  const rugToClaim: TokenAmount | undefined = useTotalRugEarned()

  const totalSupply: TokenAmount | undefined = useTotalSupply(rug)

  // Determine RUG price in AVAX
  const wavax = WAVAX[chainId ? chainId : 43114]
  const [, avaxRugTokenPair] = usePair(wavax, rug)
  const oneToken = JSBI.BigInt(1000000000000000000)
  const { t } = useTranslation()
  let rugPrice: number | undefined
  if (avaxRugTokenPair && rug) {
    const avaxRugRatio = JSBI.divide(
      JSBI.multiply(oneToken, avaxRugTokenPair.reserveOf(wavax).raw),
      avaxRugTokenPair.reserveOf(rug).raw
    )
    rugPrice = JSBI.toNumber(avaxRugRatio) / 1000000000000000000
  }

  const [circulation, setCirculation] = useState(totalSupply)

  useMemo(() => {
    if (rug === undefined) return
    fetch(`https://api.rugenerous.exchange/rug/circulating-supply`)
      .then(res => res.text())
      .then(val => setCirculation(new TokenAmount(rug, val)))
  }, [rug])

  return (
    <ContentWrapper gap="lg">
      <ModalUpper>
        <CardBGImage />
        <CardNoise />
        <CardSection gap="md">
          <RowBetween>
            <TYPE.white color="white">{t('header.rugBreakDown')}</TYPE.white>
            <StyledClose stroke="white" onClick={() => setShowRugBalanceModal(false)} />
          </RowBetween>
        </CardSection>
        <Break />
        {account && (
          <>
            <CardSection gap="sm">
              <AutoColumn gap="md" justify="center">
                <RugTokenAnimated width="48px" src={tokenLogo} />{' '}
                <TYPE.white fontSize={48} fontWeight={600} color="white">
                  {total?.toFixed(2, { groupSeparator: ',' })}
                </TYPE.white>
              </AutoColumn>
              <AutoColumn gap="md">
                <RowBetween>
                  <TYPE.white color="white">{t('header.balance')}</TYPE.white>
                  <TYPE.white color="white">{rugBalance?.toFixed(2, { groupSeparator: ',' })}</TYPE.white>
                </RowBetween>
                <RowBetween>
                  <TYPE.white color="white">{t('header.unclaimed')}</TYPE.white>
                  <TYPE.white color="white">
                    {rugToClaim?.toFixed(4, { groupSeparator: ',' })}{' '}
                    {rugToClaim && rugToClaim.greaterThan('0') && (
                      <StyledInternalLink
                        onClick={() => setShowRugBalanceModal(false)}
                        to={`/rug/${DOUBLE_SIDE_STAKING_REWARDS_CURRENT_VERSION}`}>
                        ({t('earn.claim')})
                      </StyledInternalLink>
                    )}
                  </TYPE.white>
                </RowBetween>
              </AutoColumn>
            </CardSection>
            <Break />
          </>
        )}
        <CardSection gap="sm">
          <AutoColumn gap="md">
            <RowBetween>
              <TYPE.white color="white">{t('header.rugPrice')}</TYPE.white>
              <TYPE.white color="white">{rugPrice?.toFixed(5) ?? '-'} AVAX</TYPE.white>
            </RowBetween>
            <RowBetween>
              <TYPE.white color="white">{t('header.rugCirculation')}</TYPE.white>
              <TYPE.white color="white">{circulation?.toFixed(0, { groupSeparator: ',' })}</TYPE.white>
            </RowBetween>
            <RowBetween>
              <TYPE.white color="white">{t('header.totalSupply')}</TYPE.white>
              <TYPE.white color="white">{totalSupply?.toFixed(0, { groupSeparator: ',' })}</TYPE.white>
            </RowBetween>
          </AutoColumn>
        </CardSection>
        {account && (
          <>
          <CardSection gap="sm">
            <AutoColumn gap="md">
              <AddRUG onClick={() => {
                injected.getProvider().then(provider => {
                  if (provider) {
                    provider.request({
                      method: 'wallet_watchAsset',
                      params: {
                        type: 'ERC20',
                        options: {
                          address: rug?.address,
                          symbol: rug?.symbol,
                          decimals: rug?.decimals,
                          image: 'https://raw.githubusercontent.com/rugenerous/tokens/main/assets/0x60781C2586D68229fde47564546784ab3fACA982/logo.rug',
                        },
                      },
                    }).catch((error: any) => {
                      console.error(error)
                    })
                  }
                });
              }
            }>
                <TYPE.white color="white">{t('header.addMetamask')}</TYPE.white>
              </AddRUG>
            </AutoColumn>
          </CardSection>
          </>
          )
        }
      </ModalUpper>
    </ContentWrapper>
  )
}

import React, { useCallback, useMemo, useState } from 'react'
import { AutoColumn } from '../../components/Column'
import styled from 'styled-components'

import { ChainId, JSBI } from '@rugenerous/sdk'
import { Link, RouteComponentProps } from 'react-router-dom'
import { useCurrency } from '../../hooks/Tokens'
import { useWalletModalToggle } from '../../state/application/hooks'
import { TYPE } from '../../theme'

import { RowBetween } from '../../components/Row'
import { CardSection, DataCard } from '../../components/earn/styled'
import { ButtonPrimary, ButtonEmpty, ButtonSecondary } from '../../components/Button'
import { useSingleSideStakingInfo } from '../../state/stake/hooks'
import { useActiveWeb3React } from '../../hooks'
import { useColor } from '../../hooks/useColor'
import { CountUp } from 'use-count-up'

import { wrappedCurrency } from '../../utils/wrappedCurrency'
import usePrevious from '../../hooks/usePrevious'
import { BIG_INT_ZERO, RUG, ZERO_ADDRESS } from '../../constants'
import CurrencyLogo from '../../components/CurrencyLogo'
import StakingModalSingleSide from '../../components/earn/StakingModalSingleSide'
import UnstakingModalSingleSide from '../../components/earn/UnstakingModalSingleSide'
import ClaimRewardModalSingleSide from '../../components/earn/ClaimRewardModalSingleSide'
import { useTokenBalance } from '../../state/wallet/hooks'
import { useTranslation } from 'react-i18next'
import Loader from '../../components/Loader'

const PageWrapper = styled(AutoColumn)`
   max-width: 640px;
   width: 100%;
 `

const PositionInfo = styled(AutoColumn) <{ dim: any }>`
   position: relative;
   max-width: 640px;
   width: 100%;
   opacity: ${({ dim }) => (dim ? 0.6 : 1)};
 `

const BottomSection = styled(AutoColumn)`
   border-radius: 12px;
   width: 100%;
   position: relative;
 `

const StyledDataCard = styled(DataCard) <{ bgColor?: any; showBackground?: any }>`
   background: radial-gradient(76.02% 75.41% at 1.84% 0%, #1e1a31 0%, #3d51a5 100%);
   z-index: 2;
   box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
   background: ${({ theme, bgColor, showBackground }) =>
		`radial-gradient(91.85% 100% at 1.84% 0%, ${bgColor} 0%,  ${showBackground ? theme.black : theme.bg5} 100%) `};
 `

const StyledBottomCard = styled(DataCard) <{ dim: any }>`
   background: ${({ theme }) => theme.bg3};
   opacity: ${({ dim }) => (dim ? 0.4 : 1)};
   margin-top: -40px;
   padding: 0 1.25rem 1rem 1.25rem;
   padding-top: 32px;
   z-index: 1;
 `

const PoolData = styled(DataCard)`
   background: none;
   border: 1px solid ${({ theme }) => theme.bg4};
   padding: 1rem;
   z-index: 1;
 `

const DataRow = styled(RowBetween)`
   justify-content: center;
   gap: 12px;

   ${({ theme }) => theme.mediaWidth.upToSmall`
     flex-direction: column;
     gap: 12px;
   `};
 `

export default function Manage({
	match: {
		params: { rewardCurrencyId, version }
	}
}: RouteComponentProps<{ rewardCurrencyId: string; version: string }>) {
	const { account, chainId } = useActiveWeb3React()
	const { t } = useTranslation()

	const rewardCurrency = useCurrency(rewardCurrencyId)
	const rewardToken = wrappedCurrency(rewardCurrency ?? undefined, chainId)

	const stakingInfo = useSingleSideStakingInfo(Number(version), rewardToken)?.[0]
  const rug = RUG[chainId ? chainId : ChainId.AVALANCHE]

	const backgroundColorStakingToken = useColor(rug)

	// detect existing unstaked position to show purchase button if none found
	const userRugUnstaked = useTokenBalance(account ?? undefined, stakingInfo?.stakedAmount?.token)
	const showGetRugButton = useMemo(() => {
    if (!userRugUnstaked || !stakingInfo) return true
    return Boolean(stakingInfo?.stakedAmount?.equalTo('0') && userRugUnstaked?.equalTo('0'))
  }, [stakingInfo, userRugUnstaked])

	const [showStakingModal, setShowStakingModal] = useState(false)
	const [showUnstakingModal, setShowUnstakingModal] = useState(false)
	const [showClaimRewardModal, setShowClaimRewardModal] = useState(false)

	const countUpAmount = stakingInfo?.earnedAmount?.toFixed(6) ?? '0'
	const countUpAmountPrevious = usePrevious(countUpAmount) ?? '0'

	const toggleWalletModal = useWalletModalToggle()

	const handleStakeClick = useCallback(() => {
		if (account) {
			setShowStakingModal(true)
		} else {
			toggleWalletModal()
		}
	}, [account, toggleWalletModal])

	return (
		<PageWrapper gap="lg" justify="center">
			<RowBetween style={{ gap: '24px' }}>
        <CurrencyLogo currency={rug} />
				<TYPE.mediumHeader style={{ margin: 0 }}>
          {t('earnPage.rugStaking')}
         </TYPE.mediumHeader>
				<CurrencyLogo currency={rewardCurrency ?? undefined} />
			</RowBetween>

			<DataRow style={{ gap: '24px' }}>
				<PoolData>
					<AutoColumn gap="sm">
						<TYPE.body style={{ margin: 0 }}>{t('earnPage.totalStaked')}</TYPE.body>
						<TYPE.body fontSize={24} fontWeight={500}>
							{stakingInfo
								? `${stakingInfo.totalStakedInRug?.toSignificant(4, { groupSeparator: "," })} RUG`
								: <Loader />
							}
						</TYPE.body>
					</AutoColumn>
				</PoolData>
				<PoolData>
					<AutoColumn gap="sm">
						<TYPE.body style={{ margin: 0 }}>APR</TYPE.body>
						<TYPE.body fontSize={24} fontWeight={500}>
							{stakingInfo
								? JSBI.greaterThan(stakingInfo.apr, JSBI.BigInt(0))
									? `${stakingInfo.apr?.toLocaleString()}%`
									: ' - '
								: <Loader />
							}
						</TYPE.body>
					</AutoColumn>
				</PoolData>
			</DataRow>

			{stakingInfo && (
				<>
					<StakingModalSingleSide
						isOpen={showStakingModal}
						onDismiss={() => setShowStakingModal(false)}
						stakingInfo={stakingInfo}
						userLiquidityUnstaked={userRugUnstaked}
					/>
					<UnstakingModalSingleSide
						isOpen={showUnstakingModal}
						onDismiss={() => setShowUnstakingModal(false)}
						stakingInfo={stakingInfo}
					/>
					<ClaimRewardModalSingleSide
						isOpen={showClaimRewardModal}
						onDismiss={() => setShowClaimRewardModal(false)}
						stakingInfo={stakingInfo}
					/>
				</>
			)}

			<PositionInfo gap="lg" justify="center" dim={showGetRugButton}>
				<BottomSection gap="lg" justify="center">
					<StyledDataCard bgColor={backgroundColorStakingToken} showBackground={!showGetRugButton}>
						<CardSection>
							<AutoColumn gap="md">
								<RowBetween>
									<TYPE.white fontWeight={600}>
										{t('earnPage.yourStakedToken', { symbol: 'RUG' })}
									</TYPE.white>
								</RowBetween>
								<RowBetween style={{ alignItems: 'baseline' }}>
									<TYPE.white fontSize={36} fontWeight={600}>
										{stakingInfo?.stakedAmount?.toSignificant(6) ?? '-'}
									</TYPE.white>
									<TYPE.white>
										RUG
									</TYPE.white>
								</RowBetween>
							</AutoColumn>
						</CardSection>
					</StyledDataCard>
					<StyledBottomCard dim={stakingInfo?.stakedAmount?.equalTo(JSBI.BigInt(0))}>
						<AutoColumn gap="sm">
							<RowBetween>
								<div>
									<TYPE.black>
										{t('earnPage.unclaimedReward', { symbol: stakingInfo?.rewardToken?.symbol })}
									</TYPE.black>
								</div>
								{stakingInfo?.earnedAmount && JSBI.notEqual(BIG_INT_ZERO, stakingInfo?.earnedAmount?.raw) && (
									<ButtonEmpty
										padding="8px"
										borderRadius="8px"
										width="fit-content"
										onClick={() => setShowClaimRewardModal(true)}
									>
										{t('earnPage.claim')}
									</ButtonEmpty>
								)}
							</RowBetween>
							<RowBetween style={{ alignItems: 'baseline' }}>
								<TYPE.largeHeader fontSize={36} fontWeight={600}>
									<CountUp
										key={countUpAmount}
										isCounting
										decimalPlaces={4}
										start={parseFloat(countUpAmountPrevious)}
										end={parseFloat(countUpAmount)}
										thousandsSeparator={','}
										duration={1}
									/>
								</TYPE.largeHeader>
								<TYPE.black fontSize={16} fontWeight={500}>
									<span role="img" aria-label="wizard-icon" style={{ marginRight: '8px' }}>
										⚡
                   </span>
									{stakingInfo?.rewardRate
										?.multiply((60 * 60 * 24 * 7).toString())
										?.toSignificant(4, { groupSeparator: ',' }) ?? '-'}
                  {t('earnPage.rewardPerWeek', { symbol: rewardCurrency?.symbol })}
                </TYPE.black>
							</RowBetween>
						</AutoColumn>
					</StyledBottomCard>
				</BottomSection>
			</PositionInfo>

      <DataRow style={{ marginBottom: '1rem' }}>
        {userRugUnstaked?.greaterThan('0') ? (
          <ButtonPrimary padding="10px" borderRadius="8px" width="auto" onClick={handleStakeClick}>
            {stakingInfo?.stakedAmount?.greaterThan(JSBI.BigInt(0))
              ? t('earnPage.stake')
              : t('earnPage.stakeStakingTokens', { symbol: 'RUG' })}
          </ButtonPrimary>
        ) : (
          <ButtonPrimary
            padding="10px"
            width="auto"
            as={Link}
            to={`/swap?inputCurrency=${ZERO_ADDRESS}&outputCurrency=${rug.address}`}>
	          {t('earnPage.getToken', { symbol: 'RUG' })}
          </ButtonPrimary>
        )}

        {stakingInfo?.stakedAmount?.greaterThan('0') && (
          <ButtonSecondary
            padding="10px"
            borderRadius="8px"
            width="auto"
            onClick={() => setShowUnstakingModal(true)}
          >
            {t('earnPage.unstake')}
          </ButtonSecondary>
        )}
      </DataRow>

      {userRugUnstaked?.greaterThan('0') && (
        <TYPE.main>
	        {userRugUnstaked.toSignificant(6)} {t('earnPage.stakingTokensAvailable', { symbol: 'RUG' })}
        </TYPE.main>
      )}
		</PageWrapper>
	)
}

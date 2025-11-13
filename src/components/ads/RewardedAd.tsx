import React, { useEffect, useState, useRef, useCallback } from 'react'
import { Alert, Platform } from 'react-native'
import {
  RewardedAd,
  RewardedAdEventType,
  TestIds,
  AdEventType,
} from 'react-native-google-mobile-ads'
import StyledButton from '../StyledButton'

const adUnitId = __DEV__
  ? TestIds.REWARDED
  : Platform.select({
      ios: process.env.EXPO_PUBLIC_ADMOB_REWARDED_ID_IOS,
      android: process.env.EXPO_PUBLIC_ADMOB_REWARDED_ID_ANDROID,
    })

interface AdLoadError {
  message: string
  code?: number
}

interface RewardedAdProps {
  onRewarded: () => void
  onAdFailedToLoad?: (error: AdLoadError) => void
  onAdClosed?: () => void
  buttonTitle?: string
  disabled?: boolean
}

const AdRewarded: React.FC<RewardedAdProps> = ({
  onRewarded,
  onAdFailedToLoad,
  onAdClosed,
  buttonTitle = 'Assistir Anúncio para Desbloquear',
  disabled = false,
}) => {
  const [isAdLoading, setIsAdLoading] = useState(true)
  const rewardedAdRef = useRef<RewardedAd | null>(null)

  // Usar uma ref para o callback para evitar problemas de stale closure
  const onRewardedRef = useRef(onRewarded)
  useEffect(() => {
    onRewardedRef.current = onRewarded
  }, [onRewarded])

  useEffect(() => {
    if (!adUnitId) {
      console.warn('Rewarded Ad Unit ID not configured.')
      return
    }

    const ad = RewardedAd.createForAdRequest(adUnitId, {
      requestNonPersonalizedAdsOnly: true,
    })
    rewardedAdRef.current = ad

    const loadListener = ad.addAdEventListener(
      RewardedAdEventType.LOADED,
      () => {
        setIsAdLoading(false)
      },
    )

    const rewardListener = ad.addAdEventListener(
      RewardedAdEventType.EARNED_REWARD,
      (reward) => {
        console.log('User earned reward of ', reward)
        // Chamar a versão mais recente do callback
        onRewardedRef.current()
      },
    )

    const closeListener = ad.addAdEventListener(AdEventType.CLOSED, () => {
      onAdClosed?.()
      // Carrega um novo anúncio para a próxima vez
      setIsAdLoading(true)
      ad.load()
    })

    const errorListener = ad.addAdEventListener(AdEventType.ERROR, (error) => {
      console.error('Rewarded Ad Error:', error)
      setIsAdLoading(false)
      onAdFailedToLoad?.(error)
    })

    // Inicia o carregamento
    ad.load()

    return () => {
      loadListener()
      rewardListener()
      closeListener()
      errorListener()
    }
    // O array de dependências está vazio para que o useEffect seja executado apenas uma vez
  }, [onAdClosed, onAdFailedToLoad])

  const showAd = useCallback(() => {
    if (rewardedAdRef.current && !isAdLoading) {
      rewardedAdRef.current.show()
    } else {
      Alert.alert(
        'Anúncio não disponível',
        'O anúncio ainda não foi carregado. Por favor, tente novamente em alguns segundos.',
      )
    }
  }, [isAdLoading])

  return (
    <StyledButton
      title={isAdLoading ? 'Carregando Anúncio...' : buttonTitle}
      onPress={showAd}
      isLoading={isAdLoading}
      disabled={disabled || isAdLoading}
    />
  )
}

export default AdRewarded

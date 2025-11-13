// src/components/ads/BannerAd.tsx
import React, { useState } from 'react'
import { View, StyleSheet, Platform } from 'react-native'
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads'
import { useSubscriptionStatus } from '../../hooks/useSubscriptionStatus'
import { theme } from '../../theme'

// ID do seu bloco de anúncios (substitua pelos seus IDs reais)
// Para testes, use TestIds.BANNER
const adUnitId = __DEV__
  ? TestIds.BANNER
  : Platform.select({
      ios: process.env.EXPO_PUBLIC_ADMOB_BANNER_ID_IOS,
      android: process.env.EXPO_PUBLIC_ADMOB_BANNER_ID_ANDROID,
    })

interface BannerAdProps {
  size?: BannerAdSize // Tamanho do banner, padrão é BANNER
}

const AdBanner: React.FC<BannerAdProps> = ({ size = BannerAdSize.BANNER }) => {
  const { isPremium } = useSubscriptionStatus()
  const [hasError, setHasError] = useState(false) // Estado para controlar o erro

  // Não renderiza o anúncio se o usuário for premium, se o adUnitId não estiver configurado, ou se ocorreu um erro
  if (isPremium || !adUnitId || hasError) {
    return null
  }

  return (
    <View style={styles.bannerContainer}>
      <BannerAd
        unitId={adUnitId}
        size={size}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
        onAdLoaded={() => {
          console.log('Banner ad loaded successfully')
        }}
        onAdFailedToLoad={(error) => {
          console.error('Banner ad failed to load:', error)
          setHasError(true) // Define o estado de erro
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  bannerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: theme.spacing.medium,
    // Altura mínima para evitar layout shifting quando o anúncio carrega
    minHeight: 50, // Altura padrão para BANNER_AD_SIZE
  },
})

export default AdBanner

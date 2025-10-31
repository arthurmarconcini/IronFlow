import { useProfileStore } from '../state/profileStore'

/**
 * Hook para verificar o status da assinatura do usuário.
 * Lê o perfil do `profileStore` e retorna o tipo de plano e um booleano `isPremium`.
 *
 * @returns \{ isPremium: boolean, planType: 'free' | 'premium' | null \}
 */
export const useSubscription = () => {
  const profile = useProfileStore((state) => state.profile)

  const planType = profile?.planType ?? null
  const isPremium = planType === 'premium'

  return { isPremium, planType }
}

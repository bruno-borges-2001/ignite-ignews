import styles from './styles.module.scss'
import { useSession, signIn } from 'next-auth/react'
import { api } from '../../services/api'
import { getStripeJs } from '../../services/stripe-js'

interface SubscribeButtonProps {
  priceId: string
}

export function SubscribeButton({ priceId }: SubscribeButtonProps) {
  const { data, status } = useSession()

  async function handleSubscribe() {
    if (status !== 'authenticated') {
      signIn('github')
      return
    }

    try {
      const response = await api.post('/subscribe', data)
      console.log(response.data)

      const stripe = await getStripeJs()

      await stripe.redirectToCheckout(response.data)
    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <button type="button" className={styles.subscribeButton} onClick={handleSubscribe}>
      Subscribe now
    </button>
  )
}
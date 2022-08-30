import styles from './styles.module.scss'
import { useSession, signIn } from 'next-auth/react'
import { api } from '../../services/api'
import { getStripeJs } from '../../services/stripe-js'
import { useRouter } from 'next/router'

interface SubscribeButtonProps {
  priceId: string
}

export function SubscribeButton({ priceId }: SubscribeButtonProps) {
  const { data, status } = useSession()
  const { push } = useRouter()

  async function handleSubscribe() {
    if (status !== 'authenticated') {
      signIn('github')
      return
    }

    if (data.activeSubscription) {
      push('/posts')
      return;
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
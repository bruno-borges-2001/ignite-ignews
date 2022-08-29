import { query as q } from 'faunadb'
import { NextApiRequest, NextApiResponse } from "next";
import { fauna } from "../../services/fauna";
import { stripe } from "../../services/stripe";

type User = {
  ref: {
    id: string
  },
  data: {
    stripe_customer_id?: string
  }
}
const subscribe = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const user = await fauna.query<User>(
      q.Get(
        q.Match(
          q.Index('user_by_email'),
          q.Casefold(req.body.user.email)
        )
      )
    )

    let customerId = user.data.stripe_customer_id

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: req.body.user.email,
      })

      await fauna.query(
        q.Update(
          q.Ref(q.Collection('users'), user.ref.id),
          { data: { stripe_customer_id: customer.id } }
        )
      )

      customerId = customer.id
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      billing_address_collection: 'required',
      mode: 'subscription',
      allow_promotion_codes: true,
      line_items: [{ price: 'price_1La43ABk6vdMNTGZfejnDH82', quantity: 1 }],
      success_url: process.env.STRIPE_SUCCESS_URL,
      cancel_url: process.env.STRIPE_CANCEL_URL
    })

    return res.status(200).json({ sessionId: checkoutSession.id, })
  } else {
    res.setHeader('Allow', 'POST')
    res.status(405).end('Method not allowed')
  }
}

export default subscribe
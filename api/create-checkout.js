import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {

  const { amount, invoice, account } = req.query;

  const amountCents = Math.round(amount * 100);

  try {

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],

      line_items: [{
        price_data: {
          currency: "eur",
          product_data: {
            name: "Invoice " + invoice,
          },
          unit_amount: amountCents,
        },
        quantity: 1,
      }],

      mode: "payment",

      payment_intent_data: {
        transfer_data: {
          destination: account,
        },
      },

      success_url: "https://example.com/success",
      cancel_url: "https://example.com/cancel",
    });

    // ✅ redirect umjesto JSON-a
    res.redirect(303, session.url);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

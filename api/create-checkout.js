import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {

  // uzmi parametre iz URL-a
  const { amount, invoice, account } = req.query;

  // dodatna sigurnost (nije obavezno ali dobro)
  if (!amount || !account) {
    return res.status(400).json({ error: "Missing parameters" });
  }

  // pretvori u cente (Stripe radi u centima)
  const amountCents = Math.round(parseFloat(amount) * 100);

  try {

    const session = await stripe.checkout.sessions.create({

      payment_method_types: ["card"],

      line_items: [{
        price_data: {
          currency: "eur",
          product_data: {
            name: "Invoice " + (invoice || "N/A"),
          },
          unit_amount: amountCents,
        },
        quantity: 1,
      }],

      mode: "payment",

      // ✅ STRIPE CONNECT (najvažniji dio)
      payment_intent_data: {
        transfer_data: {
          destination: account,
        },
      },

      // ✅ ako želiš kasnije proviziju, samo odkomentiraj:
      // application_fee_amount: 200,

      success_url: "https://google.com",
      cancel_url: "https://google.com",

    });

    // ✅ redirect direktno na checkout (najbolje za VBA)
    return res.redirect(303, session.url);

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

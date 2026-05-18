const { syncUserFromStripeSub, getUserByStripeCustomerId } = require("./db");
const { getStripe } = require("./stripe-helpers");

async function handleWebhook(req, res) {
  const sig = req.headers["stripe-signature"];
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    return res.status(500).send("Webhook secret not configured");
  }

  let event;
  try {
    event = getStripe().webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Webhook signature verification failed", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const email = (session.metadata?.email || session.customer_email || "").toLowerCase().trim();
        const subscriptionId =
          typeof session.subscription === "string" ? session.subscription : session.subscription?.id;
        const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;
        if (email && subscriptionId) {
          const sub = await getStripe().subscriptions.retrieve(subscriptionId);
          await syncUserFromStripeSub(email, sub, { stripeCustomerId: customerId });
        } else if (email) {
          await syncUserFromStripeSub(email, null, { stripeCustomerId: customerId });
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object;
        let email = (sub.metadata?.email || "").toLowerCase().trim();
        const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer?.id;

        if (!email && customerId) {
          const customer = await getStripe().customers.retrieve(customerId);
          email = (customer.email || "").toLowerCase().trim();
        }
        if (!email && customerId) {
          const byCustomer = await getUserByStripeCustomerId(customerId);
          email = byCustomer?.email;
        }

        if (email) {
          if (event.type === "customer.subscription.deleted") {
            await syncUserFromStripeSub(email, { ...sub, status: "canceled" }, { stripeCustomerId: customerId });
          } else {
            await syncUserFromStripeSub(email, sub, { stripeCustomerId: customerId });
          }
        }
        break;
      }
      default:
        break;
    }
  } catch (err) {
    console.error("Webhook handler error", event.type, err);
    return res.status(500).json({ error: "Webhook handler failed" });
  }

  return res.json({ received: true });
}

module.exports = { handleWebhook };

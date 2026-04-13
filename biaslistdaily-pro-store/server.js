import express from 'express';
import Stripe from 'stripe';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const domain = process.env.DOMAIN_URL || 'http://localhost:3000';

if (!stripeSecretKey) {
  console.warn('Falta STRIPE_SECRET_KEY en tu .env');
}

const stripe = new Stripe(stripeSecretKey || 'sk_test_placeholder');

const PRODUCTS = {
  armybomb: { name: 'Army Bomb Ver. 4', price: 200000 }, // en centavos
  baterias: { name: 'Baterías recargables HYPE', price: 60000 },
  cradle: { name: 'Cradle', price: 50000 },
};

const SHIPPING_PRICE = 30000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const items = Array.isArray(req.body?.items) ? req.body.items : [];

    if (!items.length) {
      return res.status(400).json({ error: 'El carrito está vacío.' });
    }

    const line_items = [];

    for (const item of items) {
      const product = PRODUCTS[item.id];
      const quantity = Number(item.quantity || 0);
      if (!product || quantity < 1) continue;

      line_items.push({
        price_data: {
          currency: 'mxn',
          product_data: { name: product.name },
          unit_amount: product.price,
        },
        quantity,
      });
    }

    if (!line_items.length) {
      return res.status(400).json({ error: 'No hay productos válidos en el carrito.' });
    }

    line_items.push({
      price_data: {
        currency: 'mxn',
        product_data: { name: 'Envío DHL Express' },
        unit_amount: SHIPPING_PRICE,
      },
      quantity: 1,
    });

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items,
      success_url: `${domain}/success.html`,
      cancel_url: `${domain}/cancel.html`,
      billing_address_collection: 'required',
      phone_number_collection: { enabled: true },
      shipping_address_collection: {
        allowed_countries: ['MX'],
      },
    });

    return res.json({ url: session.url });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'No se pudo crear la sesión de pago.' });
  }
});

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Tienda lista en ${domain} (puerto ${PORT})`);
});

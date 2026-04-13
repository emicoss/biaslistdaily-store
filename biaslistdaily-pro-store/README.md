# Bias List Daily - Tienda profesional con Stripe

## Qué incluye
- Catálogo con 3 productos
- Carrito
- Envío DHL fijo de $300 MXN por orden
- Backend con Stripe Checkout Session
- Páginas de éxito y cancelación

## Cómo activarla
1. Instala Node.js 20 o superior.
2. Abre terminal en esta carpeta.
3. Ejecuta:
   npm install
4. Copia `.env.example` a `.env`
5. En `.env` pega tu clave secreta de Stripe:
   STRIPE_SECRET_KEY=sk_live_...
6. Si ya la subiste a internet, cambia:
   DOMAIN_URL=https://tu-dominio.com
7. Ejecuta:
   npm start

## Seguridad
- La clave secreta va solo en `.env`
- No la pegues en el HTML ni en archivos públicos

## Cómo desplegar
Puedes subirla a:
- Render
- Railway
- VPS / hosting Node
- Vercel con ajustes de backend
- cualquier servidor que soporte Node.js

## Importante
Tu clave publicable por sí sola no sirve para cobrar con carrito.
Stripe recomienda crear una Checkout Session en el servidor para definir los line items, el monto y la URL de pago.

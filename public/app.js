
const PRODUCTS = {
  armybomb: { id: 'armybomb', name: 'Army Bomb Ver. 4', price: 2000 },
  baterias: { id: 'baterias', name: 'Baterías recargables HYPE', price: 600 },
  cradle: { id: 'cradle', name: 'Cradle', price: 500 },
};

const SHIPPING = 300;
const cart = JSON.parse(localStorage.getItem('bld_cart') || '{}');

const cartCount = document.getElementById('cartCount');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const drawerTotal = document.getElementById('drawerTotal');
const cartSummary = document.getElementById('cartSummary');
const cartDrawer = document.getElementById('cartDrawer');

function saveCart() {
  localStorage.setItem('bld_cart', JSON.stringify(cart));
}

function getSubtotal() {
  return Object.entries(cart).reduce((sum, [id, qty]) => sum + PRODUCTS[id].price * qty, 0);
}

function getItemCount() {
  return Object.values(cart).reduce((sum, qty) => sum + qty, 0);
}

function formatMXN(value) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(value);
}

function renderCart() {
  const itemCount = getItemCount();
  const subtotal = getSubtotal();
  const total = itemCount > 0 ? subtotal + SHIPPING : 0;

  cartCount.textContent = itemCount;
  cartTotal.textContent = `${formatMXN(total)} MXN`;
  drawerTotal.textContent = `${formatMXN(total)} MXN`;

  if (itemCount === 0) {
    cartItems.innerHTML = '<p class="empty-cart">Tu carrito está vacío.</p>';
    cartSummary.innerHTML = '<div class="summary-row"><span>Sin productos</span><strong>$0</strong></div>';
    return;
  }

  cartItems.innerHTML = Object.entries(cart).map(([id, qty]) => `
    <div class="cart-item">
      <div>
        <strong>${PRODUCTS[id].name}</strong><br />
        <small>${formatMXN(PRODUCTS[id].price)} c/u</small>
      </div>
      <div class="qty-controls">
        <button class="qty-btn" data-action="decrease" data-id="${id}">−</button>
        <span>${qty}</span>
        <button class="qty-btn" data-action="increase" data-id="${id}">+</button>
      </div>
      <strong>${formatMXN(PRODUCTS[id].price * qty)}</strong>
    </div>
  `).join('');

  cartSummary.innerHTML = Object.entries(cart).map(([id, qty]) => `
    <div class="summary-row"><span>${PRODUCTS[id].name} x${qty}</span><strong>${formatMXN(PRODUCTS[id].price * qty)}</strong></div>
  `).join('') + `<div class="summary-row"><span>Envío DHL</span><strong>${formatMXN(SHIPPING)}</strong></div>`;
}

document.querySelectorAll('.add-to-cart').forEach(btn => {
  btn.addEventListener('click', () => {
    const id = btn.dataset.id;
    cart[id] = (cart[id] || 0) + 1;
    saveCart();
    renderCart();
    cartDrawer.classList.add('open');
  });
});

document.addEventListener('click', (e) => {
  const btn = e.target.closest('.qty-btn');
  if (!btn) return;
  const { action, id } = btn.dataset;
  if (action === 'increase') cart[id] = (cart[id] || 0) + 1;
  if (action === 'decrease') {
    cart[id] = (cart[id] || 0) - 1;
    if (cart[id] <= 0) delete cart[id];
  }
  saveCart();
  renderCart();
});

document.getElementById('openCartBtn').addEventListener('click', () => cartDrawer.classList.add('open'));
document.getElementById('closeCartBtn').addEventListener('click', () => cartDrawer.classList.remove('open'));
cartDrawer.addEventListener('click', (e) => { if (e.target === cartDrawer) cartDrawer.classList.remove('open'); });

async function goCheckout() {
  if (getItemCount() === 0) {
    alert('Agrega al menos un producto al carrito.');
    return;
  }

  try {
    const items = Object.entries(cart).map(([id, quantity]) => ({ id, quantity }));
    const res = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'No se pudo crear la sesión de pago.');
    window.location.href = data.url;
  } catch (error) {
    alert(error.message || 'No se pudo crear la sesión de pago.');
  }
}

document.getElementById('checkoutBtn').addEventListener('click', goCheckout);
document.getElementById('drawerCheckoutBtn').addEventListener('click', goCheckout);

renderCart();

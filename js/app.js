const STORAGE_KEYS = {
  products: "legoLandProducts",
  cart: "legoLandCart",
  user: "legoLandUser",
  orders: "legoLandOrders",
};

const defaultProducts = [
  {
    id: "ll-rocket",
    name: "Galaxy Rocket Builder",
    category: "Space Adventures",
    price: 54.99,
    rating: 4.9,
    age: "7+",
    stock: 22,
    description: "Blast off with 320 interlocking blocks, glow tiles, and mini astronaut figures.",
    image: "assets/product-rocket.svg",
  },
  {
    id: "ll-castle",
    name: "Rainbow Castle Quest",
    category: "Fantasy Kingdom",
    price: 64.5,
    rating: 4.8,
    age: "6+",
    stock: 18,
    description: "Build a rainbow castle with moving bridges, dragons, and jewel pieces.",
    image: "assets/product-castle.svg",
  },
  {
    id: "ll-zoo",
    name: "Safari Zoo Board Game",
    category: "Family Game Night",
    price: 29.95,
    rating: 4.6,
    age: "5+",
    stock: 40,
    description: "Guide friendly animals across the board with dice and mission cards.",
    image: "assets/product-zoo.svg",
  },
  {
    id: "ll-city",
    name: "LegoTown Builder Set",
    category: "City Builders",
    price: 72.0,
    rating: 4.7,
    age: "8+",
    stock: 15,
    description: "Create a bustling city with 5 modular buildings and mini vehicles.",
    image: "assets/product-city.svg",
  },
  {
    id: "ll-ocean",
    name: "Ocean Rescue Mission",
    category: "Eco Heroes",
    price: 39.95,
    rating: 4.5,
    age: "6+",
    stock: 28,
    description: "Solve rescue puzzles to protect coral reefs and baby turtles.",
    image: "assets/product-ocean.svg",
  },
  {
    id: "ll-lab",
    name: "Science Lab Experiment Kit",
    category: "STEM Play",
    price: 44.0,
    rating: 4.8,
    age: "7+",
    stock: 25,
    description: "Combine blocks and cards to unlock safe kid-approved experiments.",
    image: "assets/product-lab.svg",
  },
];

const formatPrice = (value) => `$${value.toFixed(2)}`;

const getStored = (key, fallback) => {
  const raw = localStorage.getItem(key);
  return raw ? JSON.parse(raw) : fallback;
};

const setStored = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const ensureData = () => {
  if (!localStorage.getItem(STORAGE_KEYS.products)) {
    setStored(STORAGE_KEYS.products, defaultProducts);
  }
  if (!localStorage.getItem(STORAGE_KEYS.cart)) {
    setStored(STORAGE_KEYS.cart, []);
  }
  if (!localStorage.getItem(STORAGE_KEYS.orders)) {
    setStored(STORAGE_KEYS.orders, []);
  }
};

const getProducts = () => getStored(STORAGE_KEYS.products, []);
const saveProducts = (products) => setStored(STORAGE_KEYS.products, products);

const getCart = () => getStored(STORAGE_KEYS.cart, []);
const saveCart = (cart) => setStored(STORAGE_KEYS.cart, cart);

const getUser = () => getStored(STORAGE_KEYS.user, null);
const setUser = (user) => setStored(STORAGE_KEYS.user, user);

const getOrders = () => getStored(STORAGE_KEYS.orders, []);
const saveOrders = (orders) => setStored(STORAGE_KEYS.orders, orders);

const updateCartBadge = () => {
  const badge = document.querySelector("[data-cart-count]");
  if (!badge) return;
  const cart = getCart();
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  badge.textContent = count;
};

const renderProductCards = (container) => {
  const products = getProducts();
  container.innerHTML = products
    .map(
      (product) => `
        <article class="card">
          <img src="${product.image}" alt="${product.name}" />
          <span class="tag">${product.category}</span>
          <h3>${product.name}</h3>
          <p>${product.description}</p>
          <div class="price">${formatPrice(product.price)}</div>
          <div class="split">
            <button class="button" data-add="${product.id}">Add to cart</button>
            <a class="button secondary" href="product.html?id=${product.id}">View</a>
          </div>
        </article>
      `
    )
    .join("");
};

const addToCart = (productId) => {
  const products = getProducts();
  const product = products.find((item) => item.id === productId);
  if (!product) return;
  const cart = getCart();
  const existing = cart.find((item) => item.id === productId);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
    });
  }
  saveCart(cart);
  updateCartBadge();
};

const renderCart = () => {
  const cartItems = getCart();
  const container = document.querySelector("[data-cart-items]");
  const totalEl = document.querySelector("[data-cart-total]");
  if (!container || !totalEl) return;

  if (!cartItems.length) {
    container.innerHTML = "<p class=\"notice\">Your cart is empty. Time to add some fun!</p>";
    totalEl.textContent = formatPrice(0);
    return;
  }

  container.innerHTML = cartItems
    .map(
      (item) => `
        <div class="card">
          <div class="split">
            <div>
              <h4>${item.name}</h4>
              <p>${formatPrice(item.price)} each</p>
            </div>
            <div>
              <label>Qty</label>
              <input type="number" min="1" value="${item.quantity}" data-qty="${item.id}" />
            </div>
            <button class="button secondary" data-remove="${item.id}">Remove</button>
          </div>
        </div>
      `
    )
    .join("");

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  totalEl.textContent = formatPrice(total);
};

const renderProductDetail = () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const product = getProducts().find((item) => item.id === id);
  const container = document.querySelector("[data-product-detail]");
  if (!container) return;

  if (!product) {
    container.innerHTML = "<p class=\"notice\">Product not found. Please explore our catalog.</p>";
    return;
  }

  container.innerHTML = `
    <div class="card">
      <div class="split">
        <img src="${product.image}" alt="${product.name}" />
        <div>
          <span class="tag">${product.category}</span>
          <h2>${product.name}</h2>
          <p>${product.description}</p>
          <p><strong>Recommended Age:</strong> ${product.age}</p>
          <p><strong>In Stock:</strong> ${product.stock}</p>
          <div class="price">${formatPrice(product.price)}</div>
          <button class="button" data-add="${product.id}">Add to cart</button>
        </div>
      </div>
    </div>
  `;
};

const renderProfile = () => {
  const user = getUser();
  const container = document.querySelector("[data-profile]");
  if (!container) return;

  if (!user) {
    container.innerHTML = "<p class=\"notice\">Please sign in to see your profile.</p>";
    return;
  }

  const orders = getOrders().filter((order) => order.userEmail === user.email);
  container.innerHTML = `
    <div class="card">
      <h2>Welcome back, ${user.name}!</h2>
      <p>Email: ${user.email}</p>
      <p>Role: ${user.role}</p>
    </div>
    <div class="card">
      <h3>Your Recent Orders</h3>
      <ul>
        ${orders
          .slice(-3)
          .map(
            (order) => `<li>#${order.id} • ${order.items.length} items • ${formatPrice(order.total)}</li>`
          )
          .join("") || "<li>No orders yet.</li>"}
      </ul>
    </div>
  `;
};

const renderCheckoutSummary = () => {
  const summary = document.querySelector("[data-checkout-summary]");
  if (!summary) return;
  const cart = getCart();
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  summary.innerHTML = `
    <h3>Order Summary</h3>
    <ul>
      ${cart.map((item) => `<li>${item.name} x ${item.quantity}</li>`).join("")}
    </ul>
    <p class="price">${formatPrice(total)}</p>
  `;
};

const handleCheckout = (event) => {
  event.preventDefault();
  const cart = getCart();
  if (!cart.length) {
    alert("Your cart is empty. Add some adventures first!");
    return;
  }

  const form = event.target;
  const data = Object.fromEntries(new FormData(form).entries());
  const user = getUser() || {
    name: data.fullName,
    email: data.email,
    role: "shopper",
  };
  setUser(user);

  const order = {
    id: Math.floor(Math.random() * 90000 + 10000),
    items: cart,
    total: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    status: "Processing",
    placedAt: new Date().toISOString(),
    userEmail: user.email,
    shipping: data,
  };

  const orders = getOrders();
  orders.push(order);
  saveOrders(orders);
  saveCart([]);
  updateCartBadge();
  window.location.href = "order-success.html";
};

const renderOrderSuccess = () => {
  const container = document.querySelector("[data-order-success]");
  if (!container) return;
  const orders = getOrders();
  const latest = orders[orders.length - 1];
  if (!latest) {
    container.innerHTML = "<p class=\"notice\">No recent orders. Start building your cart!</p>";
    return;
  }
  container.innerHTML = `
    <div class="card">
      <h2>Order #${latest.id} confirmed!</h2>
      <p>We are preparing ${latest.items.length} items for delivery.</p>
      <p>Status: <strong>${latest.status}</strong></p>
      <p>Total: <strong>${formatPrice(latest.total)}</strong></p>
    </div>
  `;
};

const renderAdmin = () => {
  const orders = getOrders();
  const products = getProducts();

  const orderTable = document.querySelector("[data-admin-orders]");
  const productTable = document.querySelector("[data-admin-products]");
  const analytics = document.querySelector("[data-admin-analytics]");

  if (orderTable) {
    orderTable.innerHTML = orders
      .map(
        (order) => `
        <tr>
          <td>#${order.id}</td>
          <td>${order.userEmail}</td>
          <td>${formatPrice(order.total)}</td>
          <td>
            <select data-order-status="${order.id}">
              ${["Processing", "Packed", "Shipped", "Delivered"].map(
                (status) => `
                  <option value="${status}" ${status === order.status ? "selected" : ""}>${status}</option>
                `
              )}
            </select>
          </td>
        </tr>
      `
      )
      .join("");
  }

  if (productTable) {
    productTable.innerHTML = products
      .map(
        (product) => `
        <tr>
          <td>${product.name}</td>
          <td>${product.category}</td>
          <td>${formatPrice(product.price)}</td>
          <td>${product.stock}</td>
        </tr>
      `
      )
      .join("");
  }

  if (analytics) {
    const revenue = orders.reduce((sum, order) => sum + order.total, 0);
    analytics.innerHTML = `
      <div class="card">
        <h3>Store Performance</h3>
        <p>Total Orders: ${orders.length}</p>
        <p>Total Revenue: ${formatPrice(revenue)}</p>
        <p>Average Basket: ${formatPrice(orders.length ? revenue / orders.length : 0)}</p>
      </div>
    `;
  }
};

const handleAdminProduct = (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.target).entries());
  const products = getProducts();
  products.push({
    id: `ll-${Date.now()}`,
    name: data.name,
    category: data.category,
    price: Number(data.price),
    rating: 4.6,
    age: data.age,
    stock: Number(data.stock),
    description: data.description,
    image: "assets/product-custom.svg",
  });
  saveProducts(products);
  event.target.reset();
  renderAdmin();
};

const handleAdminStatus = (event) => {
  const target = event.target.closest("select[data-order-status]");
  if (!target) return;
  const orders = getOrders();
  const order = orders.find((item) => String(item.id) === target.dataset.orderStatus);
  if (order) {
    order.status = target.value;
    saveOrders(orders);
  }
};

const handleLogin = (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.target).entries());
  const user = {
    name: data.name,
    email: data.email,
    role: data.role,
  };
  setUser(user);
  window.location.href = "profile.html";
};

const handleCartInteractions = (event) => {
  const removeButton = event.target.closest("[data-remove]");
  if (removeButton) {
    const id = removeButton.dataset.remove;
    const cart = getCart().filter((item) => item.id !== id);
    saveCart(cart);
    renderCart();
    updateCartBadge();
    return;
  }

  const qtyInput = event.target.closest("input[data-qty]");
  if (qtyInput) {
    const cart = getCart();
    const item = cart.find((entry) => entry.id === qtyInput.dataset.qty);
    if (item) {
      item.quantity = Math.max(1, Number(qtyInput.value));
      saveCart(cart);
      renderCart();
      updateCartBadge();
    }
  }
};

const handleAddButtons = (event) => {
  const button = event.target.closest("[data-add]");
  if (button) {
    addToCart(button.dataset.add);
  }
};

const initPage = () => {
  ensureData();
  updateCartBadge();

  const page = document.body.dataset.page;
  if (page === "home" || page === "products") {
    const container = document.querySelector("[data-product-grid]");
    if (container) renderProductCards(container);
  }

  if (page === "product") {
    renderProductDetail();
  }

  if (page === "cart") {
    renderCart();
    document.addEventListener("input", handleCartInteractions);
    document.addEventListener("click", handleCartInteractions);
  }

  if (page === "checkout") {
    renderCheckoutSummary();
    const form = document.querySelector("[data-checkout-form]");
    if (form) form.addEventListener("submit", handleCheckout);
  }

  if (page === "profile") {
    renderProfile();
  }

  if (page === "login") {
    const form = document.querySelector("[data-login-form]");
    if (form) form.addEventListener("submit", handleLogin);
  }

  if (page === "order-success") {
    renderOrderSuccess();
  }

  if (page === "admin") {
    renderAdmin();
    const form = document.querySelector("[data-admin-form]");
    if (form) form.addEventListener("submit", handleAdminProduct);
    document.addEventListener("change", handleAdminStatus);
  }

  document.addEventListener("click", handleAddButtons);
};

document.addEventListener("DOMContentLoaded", initPage);

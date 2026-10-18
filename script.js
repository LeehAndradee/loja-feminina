// SENHA DO PAINEL ADMIN
const ADMIN_PASSWORD = "1234";

// PRODUTOS INICIAIS DA RP MODA FEMININA
const initialProducts = [
    {
        id: 1,
        name: "Vestido Marcante",
        price: 119.90,
        category: "Vestidos",
        sizes: ["P", "M", "G"],
        image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&q=80&w=600"
    },
    {
        id: 2,
        name: "Conjunto de Short",
        price: 89.90,
        category: "Conjuntos",
        sizes: ["P", "M", "G"],
        image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=600"
    },
    {
        id: 3,
        name: "Conjunto Calça e Cropped",
        price: 129.90,
        category: "Conjuntos",
        sizes: ["P", "M", "G"],
        image: "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?auto=format&fit=crop&q=80&w=600"
    },
    {
        id: 4,
        name: "Vestido Floral",
        price: 119.90,
        category: "Vestidos",
        sizes: ["P", "M", "G"],
        image: "https://i.ibb.co/F4F5M1Wz/5f23ef55-9031-47e7-aa80-37466ea15c5a.jpg"
    }
];

// ESTADO DA APLICAÇÃO
let products = JSON.parse(localStorage.getItem('rp_products')) || initialProducts;
let cart = JSON.parse(localStorage.getItem('rp_cart')) || [];
let storePhone = localStorage.getItem('rp_phone') || "5535999888058"; 
let selectedCategory = 'todos';
let isAdminAuthenticated = false;
let currentDetailProduct = null;

// INICIALIZAÇÃO
window.addEventListener('DOMContentLoaded', () => {
    const phoneInput = document.getElementById('storePhone');
    if (phoneInput) phoneInput.value = storePhone;
    
    const form = document.getElementById('productForm');
    if (form) {
        form.onsubmit = handleProductSubmit;
    }

    renderProducts();
    updateCartUI();
    renderAdminProductsList();
});

// ALTERAR TELEFONE DA LOJA
document.getElementById('storePhone')?.addEventListener('change', (e) => {
    storePhone = e.target.value.replace(/\D/g, '');
    localStorage.setItem('rp_phone', storePhone);
});

// AUTH ADMIN
function openAdminModal() {
    if (!isAdminAuthenticated) {
        const passwordInput = prompt("Digite a senha do Painel Administrativo:");
        if (passwordInput === ADMIN_PASSWORD) {
            isAdminAuthenticated = true;
            document.getElementById('adminModal').classList.add('active');
        } else if (passwordInput !== null) {
            alert("Senha incorreta!");
        }
    } else {
        document.getElementById('adminModal').classList.add('active');
    }
}

function closeAdminModal() {
    document.getElementById('adminModal').classList.remove('active');
    cancelEditing();
}

// RENDERIZAR PRODUTOS NA VITRINE
function renderProducts() {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;
    grid.innerHTML = '';

    const searchInput = document.getElementById('searchInput');
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';

    const filtered = products.filter(product => {
        const matchesCategory = selectedCategory === 'todos' || product.category === selectedCategory;
        const matchesSearch = product.name.toLowerCase().includes(searchTerm);
        return matchesCategory && matchesSearch;
    });

    if (filtered.length === 0) {
        grid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: #806069; padding: 40px;">Nenhum produto cadastrado.</p>`;
        return;
    }

    filtered.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';

        const sizesHtml = product.sizes.map((s, idx) => 
            `<span class="size-option ${idx === 0 ? 'selected' : ''}" onclick="selectSize(this, event)">${s}</span>`
        ).join('');

        card.innerHTML = `
            <div class="product-img-box" onclick="openProductDetailModal(${product.id})" style="cursor: pointer;" title="Clique para ver em tela cheia">
                <span class="product-badge">${product.category}</span>
                <img src="${product.image}" alt="${product.name}" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&q=80&w=600'">
            </div>
            <div class="product-info">
                <h3 class="product-title" onclick="openProductDetailModal(${product.id})" style="cursor: pointer;">${product.name}</h3>
                <div class="product-price">R$ ${Number(product.price).toFixed(2).replace('.', ',')}</div>
                <div class="product-sizes">
                    <small style="margin-right: 4px; color: #806069;">Tam:</small> ${sizesHtml}
                </div>
                <div class="product-actions">
                    <button class="btn-add-cart" onclick="addToCart(${product.id}, this)">
                        <i class="fa-solid fa-bag-shopping"></i> Sacola
                    </button>
                    <button class="btn-direct-wa" title="Perguntar via WhatsApp" onclick="buySingleDirect(${product.id}, this)">
                        <i class="fa-brands fa-whatsapp"></i>
                    </button>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

function selectSize(element, event) {
    if(event) event.stopPropagation();
    const parent = element.parentElement;
    parent.querySelectorAll('.size-option').forEach(opt => opt.classList.remove('selected'));
    element.classList.add('selected');
}

function filterCategory(cat) {
    selectedCategory = cat;
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.toggle('active', btn.innerText.trim() === cat || (cat === 'todos' && btn.innerText.trim() === 'Todos'));
    });
    renderProducts();
}

function filterProducts() {
    renderProducts();
}

// MODAL DE DETALHES / ZOOM DO PRODUTO
function openProductDetailModal(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    currentDetailProduct = product;

    document.getElementById('modalDetailName').innerText = product.name;
    document.getElementById('modalDetailCategory').innerText = product.category;
    document.getElementById('modalDetailPrice').innerText = `R$ ${Number(product.price).toFixed(2).replace('.', ',')}`;
    document.getElementById('modalDetailImg').src = product.image;

    const sizesContainer = document.getElementById('modalDetailSizes');
    sizesContainer.innerHTML = product.sizes.map((s, idx) => 
        `<span class="size-option ${idx === 0 ? 'selected' : ''}" onclick="selectSize(this)" style="padding: 6px 14px; font-size: 0.9rem;">${s}</span>`
    ).join('');

    document.getElementById('modalBtnAddCart').onclick = () => {
        const selectedSizeEl = sizesContainer.querySelector('.size-option.selected');
        const selectedSize = selectedSizeEl ? selectedSizeEl.innerText : product.sizes[0];
        addCustomToCart(product, selectedSize);
        closeProductDetailModal();
    };

    document.getElementById('modalBtnWhatsApp').onclick = () => {
        const selectedSizeEl = sizesContainer.querySelector('.size-option.selected');
        const selectedSize = selectedSizeEl ? selectedSizeEl.innerText : product.sizes[0];
        
        let message = `Olá, RP MODA FEMININA! Tenho interesse na seguinte peça:\n\n`;
        message += `👗 *Produto:* ${product.name}\n`;
        message += `📏 *Tamanho:* ${selectedSize}\n`;
        message += `💵 *Preço:* R$ ${Number(product.price).toFixed(2).replace('.', ',')}\n\n`;
        message += `Está disponível?`;

        window.open(`https://wa.me/${storePhone}?text=${encodeURIComponent(message)}`, '_blank');
    };

    document.getElementById('productDetailModal').classList.add('active');
}

function closeProductDetailModal() {
    document.getElementById('productDetailModal').classList.remove('active');
}

// SACOLA DE COMPRAS
function addToCart(productId, buttonEl) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const card = buttonEl.closest('.product-card');
    const selectedSizeEl = card.querySelector('.size-option.selected');
    const selectedSize = selectedSizeEl ? selectedSizeEl.innerText : (product.sizes[0] || 'U');

    addCustomToCart(product, selectedSize);
}

function addCustomToCart(product, selectedSize) {
    const cartItemIndex = cart.findIndex(item => item.id === product.id && item.selectedSize === selectedSize);

    if (cartItemIndex > -1) {
        cart[cartItemIndex].quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            selectedSize: selectedSize,
            quantity: 1
        });
    }

    localStorage.setItem('rp_cart', JSON.stringify(cart));
    updateCartUI();
    toggleCart(true);
}

function updateCartQty(index, change) {
    cart[index].quantity += change;
    if (cart[index].quantity <= 0) cart.splice(index, 1);
    localStorage.setItem('rp_cart', JSON.stringify(cart));
    updateCartUI();
}

function updateCartUI() {
    const cartBody = document.getElementById('cartBody');
    const cartBadge = document.getElementById('cartBadge');
    const cartTotal = document.getElementById('cartTotal');

    if (!cartBody) return;

    const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
    const totalPrice = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    if (cartBadge) cartBadge.innerText = totalItems;
    if (cartTotal) cartTotal.innerText = `R$ ${totalPrice.toFixed(2).replace('.', ',')}`;

    if (cart.length === 0) {
        cartBody.innerHTML = `
            <div style="text-align: center; color: #806069; margin-top: 50px;">
                <i class="fa-solid fa-bag-shopping" style="font-size: 3rem; color: #f8dbdf; margin-bottom: 10px;"></i>
                <p>Sua sacola está vazia.</p>
            </div>
        `;
        return;
    }

    cartBody.innerHTML = cart.map((item, idx) => `
        <div class="cart-item">
            <img src="${item.image}" class="cart-item-img" alt="${item.name}">
            <div class="cart-item-details">
                <div class="cart-item-title">${item.name}</div>
                <div class="cart-item-size">Tamanho: <strong>${item.selectedSize}</strong></div>
                <div class="cart-item-price">R$ ${Number(item.price).toFixed(2).replace('.', ',')}</div>
                <div class="cart-item-qty">
                    <button class="qty-btn" onclick="updateCartQty(${idx}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button class="qty-btn" onclick="updateCartQty(${idx}, 1)">+</button>
                </div>
            </div>
        </div>
    `).join('');
}

function toggleCart(forceOpen = false) {
    const overlay = document.getElementById('cartOverlay');
    const drawer = document.getElementById('cartDrawer');

    if (forceOpen) {
        overlay.classList.add('active');
        drawer.classList.add('active');
    } else {
        overlay.classList.toggle('active');
        drawer.classList.toggle('active');
    }
}

// CHECKOUT VIA WHATSAPP
function checkoutCart() {
    if (cart.length === 0) return alert("Sua sacola está vazia!");

    const nameInput = document.getElementById('clientName');
    const addressInput = document.getElementById('clientAddress');

    const name = nameInput ? nameInput.value.trim() : '';
    const address = addressInput ? addressInput.value.trim() : '';

    if (!name) return alert("Por favor, informe seu nome.");

    let message = `Olá, RP MODA FEMININA! Gostaria de fazer um pedido:\n\n`;
    message += `👤 *Cliente:* ${name}\n`;
    if (address) message += `📍 *Endereço:* ${address}\n`;
    message += `------------------------------------\n🛍️ *ITENS DO PEDIDO:*\n`;

    let total = 0;
    cart.forEach(item => {
        const subtotal = item.price * item.quantity;
        total += subtotal;
        message += `- ${item.quantity}x *${item.name}* (Tam: ${item.selectedSize}) - R$ ${subtotal.toFixed(2).replace('.', ',')}\n`;
    });

    message += `------------------------------------\n💰 *TOTAL:* R$ ${total.toFixed(2).replace('.', ',')}\n\n`;
    message += `Aguardo a confirmação!`;

    window.open(`https://wa.me/${storePhone}?text=${encodeURIComponent(message)}`, '_blank');
}

function buySingleDirect(productId, buttonEl) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const card = buttonEl.closest('.product-card');
    const selectedSizeEl = card.querySelector('.size-option.selected');
    const selectedSize = selectedSizeEl ? selectedSizeEl.innerText : (product.sizes[0] || 'U');

    let message = `Olá, RP MODA FEMININA! Tenho interesse na seguinte peça:\n\n`;
    message += `👗 *Produto:* ${product.name}\n`;
    message += `📏 *Tamanho:* ${selectedSize}\n`;
    message += `💵 *Preço:* R$ ${Number(product.price).toFixed(2).replace('.', ',')}\n\n`;
    message += `Está disponível?`;

    window.open(`https://wa.me/${storePhone}?text=${encodeURIComponent(message)}`, '_blank');
}

// LEITURA DE ARQUIVO
function readFileAsBase64(file) {
    return new Promise((resolve) => {
        if (!file) return resolve('');
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = () => resolve('');
        reader.readAsDataURL(file);
    });
}

// CADASTRAR OU EDITAR PRODUTO
async function handleProductSubmit(e) {
    e.preventDefault();

    const editingId = document.getElementById('editingProductId').value;
    const name = document.getElementById('prodName').value.trim();
    const price = parseFloat(document.getElementById('prodPrice').value);
    const category = document.getElementById('prodCategory').value;
    const sizesStr = document.getElementById('prodSizes').value;
    const imageUrl = document.getElementById('prodImage').value.trim();
    const fileInput = document.getElementById('prodImageFile');

    let finalImage = imageUrl;

    if (fileInput && fileInput.files && fileInput.files[0]) {
        const base64Data = await readFileAsBase64(fileInput.files[0]);
        if (base64Data) {
            finalImage = base64Data;
        }
    }

    // Se estiver editando e não enviou nova imagem, mantém a antiga
    if (editingId && !finalImage) {
        const existingProduct = products.find(p => p.id == editingId);
        if (existingProduct) finalImage = existingProduct.image;
    }

    if (!finalImage) {
        finalImage = 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&q=80&w=600';
    }

    const sizes = sizesStr.split(',').map(s => s.trim()).filter(s => s !== '');

    if (editingId) {
        // Atualiza Produto Existente
        const index = products.findIndex(p => p.id == editingId);
        if (index > -1) {
            products[index] = {
                id: Number(editingId),
                name: name,
                price: price,
                category: category,
                sizes: sizes.length > 0 ? sizes : ["P", "M", "G"],
                image: finalImage
            };
            alert('Produto atualizado com sucesso!');
        }
    } else {
        // Cadastra Novo Produto
        const newProduct = {
            id: Date.now(),
            name: name,
            price: price,
            category: category,
            sizes: sizes.length > 0 ? sizes : ["P", "M", "G"],
            image: finalImage
        };
        products.unshift(newProduct);
        alert('Produto cadastrado com sucesso!');
    }

    localStorage.setItem('rp_products', JSON.stringify(products));

    renderProducts();
    renderAdminProductsList();
    cancelEditing();
}

// EDITAR PRODUTO NO ADMIN
function editProduct(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;

    document.getElementById('editingProductId').value = product.id;
    document.getElementById('prodName').value = product.name;
    document.getElementById('prodPrice').value = product.price;
    document.getElementById('prodCategory').value = product.category;
    document.getElementById('prodSizes').value = product.sizes.join(', ');
    document.getElementById('prodImage').value = product.image;

    document.getElementById('adminFormTitle').innerText = 'Painel Admin - Editar Produto';
    const btnSubmit = document.getElementById('btnSubmitProduct');
    btnSubmit.innerHTML = '<i class="fa-solid fa-check"></i> Salvar Alterações';
    btnSubmit.style.backgroundColor = '#25d366';

    document.getElementById('btnCancelEdit').style.display = 'block';

    // Rola para o topo do modal para visualizar o formulário preenchido
    document.querySelector('#adminModal .modal-content').scrollTop = 0;
}

// CANCELAR EDIÇÃO
function cancelEditing() {
    document.getElementById('editingProductId').value = '';
    document.getElementById('productForm').reset();
    document.getElementById('adminFormTitle').innerText = 'Painel Admin - Cadastrar Produto';

    const btnSubmit = document.getElementById('btnSubmitProduct');
    btnSubmit.innerHTML = '<i class="fa-solid fa-plus"></i> Cadastrar Produto';
    btnSubmit.style.backgroundColor = 'var(--pink-dark)';

    document.getElementById('btnCancelEdit').style.display = 'none';
}

function deleteProduct(id) {
    if (confirm("Deseja realmente remover este produto?")) {
        products = products.filter(p => p.id !== id);
        localStorage.setItem('rp_products', JSON.stringify(products));
        renderProducts();
        renderAdminProductsList();
    }
}

function renderAdminProductsList() {
    const list = document.getElementById('adminProductList');
    if (!list) return;
    list.innerHTML = '';

    products.forEach(p => {
        const item = document.createElement('div');
        item.className = 'admin-product-item';
        item.innerHTML = `
            <span><strong>${p.name}</strong> - R$ ${Number(p.price).toFixed(2)}</span>
            <div style="display: flex; gap: 6px;">
                <button class="btn-delete" style="background-color: #3498db;" onclick="editProduct(${p.id})"><i class="fa-solid fa-pen"></i> Editar</button>
                <button class="btn-delete" onclick="deleteProduct(${p.id})"><i class="fa-solid fa-trash"></i> Excluir</button>
            </div>
        `;
        list.appendChild(item);
    });
}
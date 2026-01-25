<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Carrito | A.F.ONE</title>

    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap" rel="stylesheet">

    <style>
        body {
            font-family: 'Inter', sans-serif;
            background-color: #F4F4F2;
            color: #1A1A1A;
        }
        .street-title {
            font-weight: 900;
            letter-spacing: -0.05em;
            text-transform: uppercase;
        }
    </style>
</head>
<body>

<nav class="bg-white border-b px-6 py-4 flex justify-between items-center sticky top-0 z-50">
    <div class="text-xl street-title italic">
        ALIEN FORCE <span class="text-[#7B61FF]">ONE</span>
    </div>
    <a href="index.html" class="text-xs font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition">
        ← Seguir Comprando
    </a>
</nav>

<main class="max-w-5xl mx-auto px-6 py-12">
    <h1 class="text-5xl street-title italic mb-12">TU CARRITO</h1>

    <div id="carrito-vacio" class="text-center py-20 hidden">
        <p class="text-xl opacity-40 mb-8">Tu carrito está vacío</p>
        <a href="index.html" class="inline-block bg-black text-white px-8 py-3 font-black uppercase text-sm tracking-widest hover:bg-[#7B61FF] transition">
            Ir a la tienda
        </a>
    </div>

    <div id="carrito-contenido">
        <div id="items-carrito" class="space-y-6 mb-12"></div>

        <div class="border-t-2 border-black pt-8">
            <div class="flex justify-between items-center mb-8">
                <p class="text-2xl street-title italic">TOTAL</p>
                <p class="text-4xl font-black text-[#7B61FF]" id="total-carrito">$0</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button onclick="vaciarCarrito()" class="bg-white border-2 border-black px-8 py-4 font-black uppercase text-sm tracking-widest hover:bg-black hover:text-white transition">
                    Vaciar Carrito
                </button>

                <button onclick="iniciarCheckout()" class="bg-black text-white px-8 py-4 font-black uppercase text-sm tracking-widest hover:bg-[#7B61FF] transition">
                    Pagar con MercadoPago
                </button>
            </div>

            <p id="checkout-status" class="text-xs text-center mt-4"></p>
        </div>
    </div>
</main>

<script>
function cargarCarrito() {
    const carrito = JSON.parse(localStorage.getItem('afone_carrito') || '[]');

    if (carrito.length === 0) {
        document.getElementById('carrito-vacio').classList.remove('hidden');
        document.getElementById('carrito-contenido').classList.add('hidden');
        return;
    }

    document.getElementById('carrito-vacio').classList.add('hidden');
    document.getElementById('carrito-contenido').classList.remove('hidden');

    const container = document.getElementById('items-carrito');
    container.innerHTML = carrito.map((item, idx) => `
        <div class="bg-white p-6 flex gap-6 items-center border border-black/5">
            <img src="${item.imagen}" class="w-24 h-24 object-cover"/>

            <div class="flex-1">
                <h3 class="font-bold text-lg mb-1">${item.nombre}</h3>
                <p class="text-xs opacity-60 uppercase tracking-widest mb-2">Talle: ${item.talle}</p>
                <p class="font-black text-xl text-[#7B61FF]">$${item.precio}</p>
            </div>

            <div class="flex items-center gap-3">
                <button onclick="cambiarCantidad(${idx}, -1)" class="w-8 h-8 border">-</button>
                <span class="w-10 text-center font-bold">${item.cantidad}</span>
                <button onclick="cambiarCantidad(${idx}, 1)" class="w-8 h-8 border">+</button>
            </div>

            <button onclick="eliminarItem(${idx})" class="text-red-600 text-sm uppercase font-bold">
                Eliminar
            </button>
        </div>
    `).join('');

    actualizarTotal();
}

function actualizarTotal() {
    const carrito = JSON.parse(localStorage.getItem('afone_carrito') || '[]');
    const total = carrito.reduce((sum, i) => sum + i.precio * i.cantidad, 0);
    document.getElementById('total-carrito').textContent = `$${total.toLocaleString()}`;
}

function cambiarCantidad(index, delta) {
    const carrito = JSON.parse(localStorage.getItem('afone_carrito') || '[]');
    carrito[index].cantidad += delta;

    if (carrito[index].cantidad <= 0) carrito.splice(index, 1);

    localStorage.setItem('afone_carrito', JSON.stringify(carrito));
    cargarCarrito();
}

function eliminarItem(index) {
    const carrito = JSON.parse(localStorage.getItem('afone_carrito') || '[]');
    carrito.splice(index, 1);
    localStorage.setItem('afone_carrito', JSON.stringify(carrito));
    cargarCarrito();
}

function vaciarCarrito() {
    if (confirm('¿Vaciar todo el carrito?')) {
        localStorage.setItem('afone_carrito', JSON.stringify([]));
        cargarCarrito();
    }
}

async function iniciarCheckout() {
    const carrito = JSON.parse(localStorage.getItem('afone_carrito') || '[]');
    const status = document.getElementById('checkout-status');

    if (carrito.length === 0) {
        status.textContent = '⚠️ El carrito está vacío';
        return;
    }

    status.textContent = 'Generando pago...';

    try {
        // Se deja genérico, no expone ningún token ni email
        const response = await fetch('/api/create-preference', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items: carrito }) // El token se usa en el backend, no en frontend
        });

        const data = await response.json();

        if (data.init_point) {
            window.location.href = data.init_point;
        } else {
            throw new Error('Respuesta inválida');
        }

    } catch (err) {
        console.error(err);
        status.textContent = '❌ Error al iniciar el pago';
    }
}

cargarCarrito();
</script>

<footer class="bg-black text-white py-12 px-6 mt-20">
    <div class="max-w-7xl mx-auto text-center">
        <div class="text-xl street-title italic mb-4">
            ALIEN FORCE <span class="text-[#7B61FF]">ONE</span>
        </div>
        <p class="text-xs opacity-60">Proyecto en desarrollo</p>
    </div>
</footer>

</body>
</html>

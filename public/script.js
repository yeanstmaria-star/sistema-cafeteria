// script.js - La magia que hace funcionar nuestras tabletas

class MenuDigital {
    constructor() {
        this.carrito = [];
        this.menu = [];
        this.mesaNumero = Math.floor(Math.random() * 10) + 1; // Mesa aleatoria 1-10
        
        this.inicializar();
    }

    inicializar() {
        // Mostrar número de mesa
        document.getElementById('mesa-numero').textContent = this.mesaNumero;
        
        // Cargar el menú cuando la página se abra
        this.cargarMenu();
        
        // Configurar botones
        document.getElementById('send-order').addEventListener('click', () => {
            this.enviarPedido();
        });
    }

    // Método para cargar el menú desde nuestro servidor
    async cargarMenu() {
        try {
            console.log('🔄 Cargando menú desde el servidor...');
            
            const respuesta = await fetch('http://localhost:3000/menu');
            const datosMenu = await respuesta.json();
            
            console.log('✅ Menú cargado:', datosMenu);
            this.menu = this.procesarMenu(datosMenu);
            this.mostrarMenu();
            
        } catch (error) {
            console.error('❌ Error cargando menú:', error);
            this.mostrarError('No se pudo cargar el menú. Revisa que el servidor esté funcionando.');
        }
    }

    // Convertir el menú del servidor a un formato más fácil de usar
    procesarMenu(datos) {
        let todosLosProductos = [];
        
        // Juntar bebidas y alimentos en una sola lista
        if (datos.bebidas) {
            datos.bebidas.forEach(bebida => {
                todosLosProductos.push({
                    ...bebida,
                    categoria: 'bebida'
                });
            });
        }
        
        if (datos.alimentos) {
            datos.alimentos.forEach(alimento => {
                todosLosProductos.push({
                    ...alimento,
                    categoria: 'alimento'
                });
            });
        }
        
        return todosLosProductos;
    }

    // Mostrar el menú en la pantalla
    mostrarMenu() {
        const contenedor = document.getElementById('menu-items');
        
        if (this.menu.length === 0) {
            contenedor.innerHTML = '<div class="loading">No hay productos disponibles</div>';
            return;
        }

        contenedor.innerHTML = this.menu.map(producto => `
            <div class="menu-item" onclick="app.agregarAlCarrito(${this.menu.indexOf(producto)})">
                <h3>${producto.nombre}</h3>
                <p class="price">$${producto.precio}</p>
                <p class="category">${producto.categoria.toUpperCase()}</p>
                <button class="add-button">Agregar al Carrito</button>
            </div>
        `).join('');
    }

    // Agregar producto al carrito
    agregarAlCarrito(indiceProducto) {
        const producto = this.menu[indiceProducto];
        
        // Verificar si el producto ya está en el carrito
        const itemExistente = this.carrito.find(item => item.nombre === producto.nombre);
        
        if (itemExistente) {
            itemExistente.cantidad += 1;
        } else {
            this.carrito.push({
                ...producto,
                cantidad: 1
            });
        }
        
        this.actualizarCarrito();
        this.mostrarMensaje(`✅ ${producto.nombre} agregado al carrito`, 'success');
    }

    // Actualizar la visualización del carrito
    actualizarCarrito() {
        const contenedor = document.getElementById('cart-items');
        const totalElement = document.getElementById('total');
        const botonEnviar = document.getElementById('send-order');
        
        if (this.carrito.length === 0) {
            contenedor.innerHTML = '<p class="empty-cart">Tu carrito está vacío</p>';
            botonEnviar.disabled = true;
            totalElement.textContent = '0.00';
            return;
        }
        
        // Mostrar items del carrito
        contenedor.innerHTML = this.carrito.map(item => `
            <div class="cart-item">
                <span>${item.nombre} x${item.cantidad}</span>
                <span>$${(item.precio * item.cantidad).toFixed(2)}</span>
            </div>
        `).join('');
        
        // Calcular y mostrar total
        const total = this.carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
        totalElement.textContent = total.toFixed(2);
        
        // Activar botón de enviar
        botonEnviar.disabled = false;
    }

    // Enviar pedido al servidor
    async enviarPedido() {
        try {
            const botonEnviar = document.getElementById('send-order');
            botonEnviar.disabled = true;
            botonEnviar.textContent = '🔄 Enviando...';
            
            const pedido = {
                mesa: this.mesaNumero,
                items: this.carrito,
                total: parseFloat(document.getElementById('total').textContent),
                timestamp: new Date().toISOString()
            };
            
            console.log('📤 Enviando pedido:', pedido);
            
            const respuesta = await fetch('http://localhost:3000/api/order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(pedido)
            });
            
            if (respuesta.ok) {
                const resultado = await respuesta.json();
                console.log('✅ Pedido enviado exitosamente:', resultado);
                
                this.mostrarMensaje('🎉 ¡Pedido enviado a cocina! Prepárate para algo delicioso.', 'success');
                
                // Limpiar carrito después de enviar
                this.carrito = [];
                this.actualizarCarrito();
                
                botonEnviar.textContent = '📤 Enviar a Cocina';
                
            } else {
                throw new Error('Error en la respuesta del servidor');
            }
            
        } catch (error) {
            console.error('❌ Error enviando pedido:', error);
            this.mostrarMensaje('😞 Error enviando el pedido. Intenta de nuevo.', 'error');
            
            const botonEnviar = document.getElementById('send-order');
            botonEnviar.disabled = false;
            botonEnviar.textContent = '📤 Enviar a Cocina';
        }
    }

    // Mostrar mensajes temporales
    mostrarMensaje(texto, tipo) {
        const mensajeElement = document.getElementById('message');
        mensajeElement.textContent = texto;
        mensajeElement.className = `message ${tipo}`;
        mensajeElement.classList.remove('hidden');
        
        setTimeout(() => {
            mensajeElement.classList.add('hidden');
        }, 3000);
    }

    mostrarError(mensaje) {
        this.mostrarMensaje(mensaje, 'error');
    }
}

// ¡Iniciar nuestra aplicación cuando la página cargue!
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new MenuDigital();
    console.log('🚀 Aplicación de tableta iniciada!');
});
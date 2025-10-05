// script-cocina.js - Pantalla de COCINA
class CocinaDisplay {
    constructor() {
        this.ordenes = [];
        this.inicializar();
        this.cargarOrdenes();
        // Actualizar cada 3 segundos
        setInterval(() => this.cargarOrdenes(), 3000);
    }

    inicializar() {
        console.log('👨‍🍳 Pantalla de COCINA iniciada');
    }

    async cargarOrdenes() {
        try {
            const respuesta = await fetch('http://localhost:3000/ordenes');
            const data = await respuesta.json();
            
            this.ordenes = data.ordenes;
            this.mostrarOrdenes();
            this.actualizarEstadisticas();
            
        } catch (error) {
            console.error('❌ Error cargando órdenes:', error);
        }
    }

    mostrarOrdenes() {
        const contenedor = document.getElementById('ordenes-cocina');
        const noOrders = document.getElementById('no-orders');

        // Filtrar solo órdenes con alimentos
        const ordenesConAlimentos = this.ordenes.filter(orden => 
            orden.items.some(item => item.categoria === 'alimento')
        );

        if (ordenesConAlimentos.length === 0) {
            contenedor.classList.add('hidden');
            noOrders.classList.remove('hidden');
            return;
        }

        contenedor.classList.remove('hidden');
        noOrders.classList.add('hidden');

        contenedor.innerHTML = ordenesConAlimentos.map(orden => {
            const alimentos = orden.items.filter(item => item.categoria === 'alimento');
            
            return `
                <div class="kitchen-order">
                    <div class="order-header">
                        <div>
                            <div class="mesa-number">MESA ${orden.mesa}</div>
                            <div class="order-id">Orden #${orden.id}</div>
                        </div>
                        <div class="order-time">${new Date(orden.timestamp).toLocaleTimeString()}</div>
                    </div>
                    
                    <div class="food-items">
                        ${alimentos.map(item => `
                            <div class="food-item">
                                <span class="item-name">${item.nombre}</span>
                                <span class="item-quantity">x${item.cantidad}</span>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="order-actions">
                        <button class="btn btn-preparando" onclick="cocina.marcarPreparando(${orden.id})">
                            👨‍🍳 Preparando
                        </button>
                        <button class="btn btn-listoo" onclick="cocina.marcarListo(${orden.id})">
                            ✅ Listo
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    actualizarEstadisticas() {
        const ordenesConAlimentos = this.ordenes.filter(orden => 
            orden.items.some(item => item.categoria === 'alimento')
        );
        
        document.getElementById('ordenes-pendientes').textContent = 
            `${ordenesConAlimentos.length} órdenes pendientes`;
    }

    marcarPreparando(ordenId) {
        console.log(`👨‍🍳 Comenzando a preparar orden ${ordenId}`);
        alert(`¡Comenzando a preparar orden #${ordenId}!`);
    }

    marcarListo(ordenId) {
        console.log(`✅ Orden ${ordenId} LISTA para servir`);
        alert(`¡Orden #${ordenId} LISTA para servir!`);
    }
}

// Iniciar la pantalla de cocina
let cocina;
document.addEventListener('DOMContentLoaded', () => {
    cocina = new CocinaDisplay();
});
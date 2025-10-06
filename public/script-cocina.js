// script-cocina.js - VERSIÓN PARA PRODUCCIÓN
class CocinaDisplay {
    constructor() {
        this.ordenes = [];
        // Obtener la URL base automáticamente
        this.baseURL = window.location.origin;
        console.log('👨‍🍳 Cocina conectada a:', this.baseURL);
        
        this.inicializar();
        this.cargarOrdenes();
        // Actualizar cada 5 segundos
        setInterval(() => this.cargarOrdenes(), 5000);
    }

    inicializar() {
        console.log('👨‍🍳 Pantalla de COCINA iniciada');
    }

    async cargarOrdenes() {
        try {
            const response = await fetch(`${this.baseURL}/ordenes`);
            const data = await response.json();
            
            if (data.success) {
                this.ordenes = data.ordenes;
                this.mostrarOrdenes();
                this.actualizarEstadisticas();
            } else {
                console.error('❌ Error en respuesta:', data);
            }
            
        } catch (error) {
            console.error('❌ Error cargando órdenes:', error);
            this.mostrarError('Error de conexión con el servidor');
        }
    }

    mostrarOrdenes() {
        const contenedor = document.getElementById('ordenes-cocina');
        const noOrders = document.getElementById('no-orders');

        // Filtrar solo órdenes con alimentos
        const ordenesConAlimentos = this.ordenes.filter(orden => {
            const itemsStr = orden.items_descripcion || '';
            return itemsStr.includes('Croissant') || 
                   itemsStr.includes('Bagel') || 
                   itemsStr.includes('Galleta') || 
                   itemsStr.includes('Sándwich') || 
                   itemsStr.includes('Ensalada');
        });

        if (ordenesConAlimentos.length === 0) {
            contenedor.classList.add('hidden');
            noOrders.classList.remove('hidden');
            return;
        }

        contenedor.classList.remove('hidden');
        noOrders.classList.add('hidden');

        contenedor.innerHTML = ordenesConAlimentos.map(orden => {
            const items = orden.items_descripcion ? orden.items_descripcion.split(',') : [];
            const alimentos = items.filter(item => 
                item.includes('Croissant') || 
                item.includes('Bagel') || 
                item.includes('Galleta') || 
                item.includes('Sándwich') || 
                item.includes('Ensalada')
            );
            
            return `
                <div class="kitchen-order">
                    <div class="order-header">
                        <div>
                            <div class="mesa-number">MESA ${orden.mesa}</div>
                            <div class="order-id">Orden #${orden.id}</div>
                        </div>
                        <div class="order-time">${new Date(orden.creado_en).toLocaleTimeString()}</div>
                    </div>
                    
                    <div class="food-items">
                        ${alimentos.map(item => `
                            <div class="food-item">
                                <span class="item-name">${item.trim()}</span>
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
        const ordenesConAlimentos = this.ordenes.filter(orden => {
            const itemsStr = orden.items_descripcion || '';
            return itemsStr.includes('Croissant') || 
                   itemsStr.includes('Bagel') || 
                   itemsStr.includes('Galleta') || 
                   itemsStr.includes('Sándwich') || 
                   itemsStr.includes('Ensalada');
        });
        
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

    mostrarError(mensaje) {
        const contenedor = document.getElementById('ordenes-cocina');
        contenedor.innerHTML = `<div class="error">${mensaje}</div>`;
    }
}

// Iniciar la pantalla de cocina
let cocina;
document.addEventListener('DOMContentLoaded', () => {
    cocina = new CocinaDisplay();
});
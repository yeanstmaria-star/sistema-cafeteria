// script-caja.js - Pantalla de CAJA
class CajaDisplay {
    constructor() {
        this.ordenes = [];
        this.inicializar();
        this.cargarOrdenes();
        // Actualizar cada 3 segundos
        setInterval(() => this.cargarOrdenes(), 3000);
    }

    inicializar() {
        console.log('💰 Pantalla de CAJA iniciada');
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
        const contenedor = document.getElementById('ordenes-caja');
        const noOrders = document.getElementById('no-orders');

        if (this.ordenes.length === 0) {
            contenedor.classList.add('hidden');
            noOrders.classList.remove('hidden');
            return;
        }

        contenedor.classList.remove('hidden');
        noOrders.classList.add('hidden');

        contenedor.innerHTML = this.ordenes.map(orden => {
            const alimentos = orden.items.filter(item => item.categoria === 'alimento');
            const bebidas = orden.items.filter(item => item.categoria === 'bebida');
            
            return `
                <div class="caja-order">
                    <div class="order-header">
                        <div class="mesa-info">
                            <div class="mesa-number">MESA ${orden.mesa}</div>
                            <div class="order-id">Orden #${orden.id}</div>
                        </div>
                        <div class="order-time">
                            ${new Date(orden.timestamp).toLocaleString()}
                        </div>
                    </div>
                    
                    <div class="order-details">
                        <div class="detail-section">
                            <h3>🍽️ Alimentos</h3>
                            <ul class="items-list">
                                ${alimentos.map(item => `
                                    <li>
                                        <span>${item.nombre}</span>
                                        <span>x${item.cantidad} - $${(item.precio * item.cantidad).toFixed(2)}</span>
                                    </li>
                                `).join('')}
                                ${alimentos.length === 0 ? '<li>No hay alimentos</li>' : ''}
                            </ul>
                        </div>
                        
                        <div class="detail-section">
                            <h3>☕ Bebidas</h3>
                            <ul class="items-list">
                                ${bebidas.map(item => `
                                    <li>
                                        <span>${item.nombre}</span>
                                        <span>x${item.cantidad} - $${(item.precio * item.cantidad).toFixed(2)}</span>
                                    </li>
                                `).join('')}
                                ${bebidas.length === 0 ? '<li>No hay bebidas</li>' : ''}
                            </ul>
                        </div>
                        
                        <div class="detail-section total-section">
                            <h3>💰 Total a Cobrar</h3>
                            <div class="total-amount">$${orden.total.toFixed(2)}</div>
                            <div class="order-status">${orden.status}</div>
                        </div>
                    </div>
                    
                    <div class="order-actions">
                        <button class="btn btn-cobrar" onclick="caja.cobrarOrden(${orden.id})">
                            💳 Cobrar $${orden.total.toFixed(2)}
                        </button>
                        <button class="btn btn-factura" onclick="caja.generarFactura(${orden.id})">
                            🧾 Generar Factura
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    actualizarEstadisticas() {
        const totalPorCobrar = this.ordenes.reduce((sum, orden) => sum + orden.total, 0);
        document.getElementById('total-cobrar').textContent = 
            `$${totalPorCobrar.toFixed(2)} por cobrar (${this.ordenes.length} órdenes)`;
    }

    cobrarOrden(ordenId) {
        const orden = this.ordenes.find(o => o.id === ordenId);
        if (orden) {
            console.log(`💰 Cobrando orden ${ordenId} - Total: $${orden.total}`);
            alert(`¡Orden #${ordenId} de Mesa ${orden.mesa} cobrada por $${orden.total}!`);
            
            // En un sistema real, aquí marcaríamos la orden como pagada
        }
    }

    generarFactura(ordenId) {
        const orden = this.ordenes.find(o => o.id === ordenId);
        if (orden) {
            console.log(`🧾 Generando factura para orden ${ordenId}`);
            
            const factura = `
FACTURA - Mi Cafetería
Orden #${orden.id} - Mesa ${orden.mesa}
${new Date().toLocaleString()}

${orden.items.map(item => 
    `${item.nombre} x${item.cantidad} - $${(item.precio * item.cantidad).toFixed(2)}`
).join('\n')}

TOTAL: $${orden.total.toFixed(2)}

¡Gracias por su visita!
            `;
            
            alert('Factura generada:\n\n' + factura);
        }
    }
}

// Iniciar la pantalla de caja
let caja;
document.addEventListener('DOMContentLoaded', () => {
    caja = new CajaDisplay();
});
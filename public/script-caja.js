// script-caja.js - VERSIÓN PARA PRODUCCIÓN
class CajaDisplay {
    constructor() {
        this.ordenes = [];
        // Obtener la URL base automáticamente
        this.baseURL = window.location.origin;
        console.log('💰 Caja conectada a:', this.baseURL);
        
        this.inicializar();
        this.cargarOrdenes();
        // Actualizar cada 5 segundos
        setInterval(() => this.cargarOrdenes(), 5000);
    }

    inicializar() {
        console.log('💰 Pantalla de CAJA iniciada');
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
            const items = orden.items_descripcion ? orden.items_descripcion.split(',') : [];
            
            // Separar alimentos y bebidas
            const alimentos = items.filter(item => 
                item.includes('Croissant') || 
                item.includes('Bagel') || 
                item.includes('Galleta') || 
                item.includes('Sándwich') || 
                item.includes('Ensalada')
            );
            
            const bebidas = items.filter(item => 
                item.includes('Capuchino') || 
                item.includes('Latte') || 
                item.includes('Té Verde') || 
                item.includes('Chocolate') || 
                item.includes('Jugo')
            );
            
            return `
                <div class="caja-order">
                    <div class="order-header">
                        <div class="mesa-info">
                            <div class="mesa-number">MESA ${orden.mesa}</div>
                            <div class="order-id">Orden #${orden.id}</div>
                        </div>
                        <div class="order-time">
                            ${new Date(orden.creado_en).toLocaleString()}
                        </div>
                    </div>
                    
                    <div class="order-details">
                        <div class="detail-section">
                            <h3>🍽️ Alimentos</h3>
                            <ul class="items-list">
                                ${alimentos.map(item => `
                                    <li>${item.trim()}</li>
                                `).join('')}
                                ${alimentos.length === 0 ? '<li>No hay alimentos</li>' : ''}
                            </ul>
                        </div>
                        
                        <div class="detail-section">
                            <h3>☕ Bebidas</h3>
                            <ul class="items-list">
                                ${bebidas.map(item => `
                                    <li>${item.trim()}</li>
                                `).join('')}
                                ${bebidas.length === 0 ? '<li>No hay bebidas</li>' : ''}
                            </ul>
                        </div>
                        
                        <div class="detail-section total-section">
                            <h3>💰 Total a Cobrar</h3>
                            <div class="total-amount">$${orden.total ? orden.total.toFixed(2) : '0.00'}</div>
                            <div class="order-status">${orden.estado || 'recibido'}</div>
                        </div>
                    </div>
                    
                    <div class="order-actions">
                        <button class="btn btn-cobrar" onclick="caja.cobrarOrden(${orden.id})">
                            💳 Cobrar $${orden.total ? orden.total.toFixed(2) : '0.00'}
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
        const totalPorCobrar = this.ordenes.reduce((sum, orden) => sum + (orden.total || 0), 0);
        document.getElementById('total-cobrar').textContent = 
            `$${totalPorCobrar.toFixed(2)} por cobrar (${this.ordenes.length} órdenes)`;
    }

    cobrarOrden(ordenId) {
        const orden = this.ordenes.find(o => o.id === ordenId);
        if (orden) {
            console.log(`💰 Cobrando orden ${ordenId} - Total: $${orden.total}`);
            alert(`¡Orden #${ordenId} de Mesa ${orden.mesa} cobrada por $${orden.total ? orden.total.toFixed(2) : '0.00'}!`);
        }
    }

    generarFactura(ordenId) {
        const orden = this.ordenes.find(o => o.id === ordenId);
        if (orden) {
            console.log(`🧾 Generando factura para orden ${ordenId}`);
            
            const items = orden.items_descripcion ? orden.items_descripcion.split(',') : [];
            
            const factura = `
FACTURA - Mi Cafetería
Orden #${orden.id} - Mesa ${orden.mesa}
${new Date().toLocaleString()}

${items.map(item => item.trim()).join('\n')}

TOTAL: $${orden.total ? orden.total.toFixed(2) : '0.00'}

¡Gracias por su visita!
            `;
            
            alert('Factura generada:\n\n' + factura);
        }
    }

    mostrarError(mensaje) {
        const contenedor = document.getElementById('ordenes-caja');
        contenedor.innerHTML = `<div class="error">${mensaje}</div>`;
    }
}

// Iniciar la pantalla de caja
let caja;
document.addEventListener('DOMContentLoaded', () => {
    caja = new CajaDisplay();
});
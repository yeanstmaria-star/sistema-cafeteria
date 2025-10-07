// script-caja.js - VERSIÓN ESTABLE
console.log('💰 script-caja.js CARGADO - Iniciando caja...');

class CajaDisplay {
    constructor() {
        this.ordenes = [];
        this.baseURL = window.location.origin;
        this.cargando = false;
        
        console.log('💰 Caja conectada a:', this.baseURL);
        
        this.inicializar();
        this.cargarOrdenes();
        setInterval(() => this.cargarOrdenes(), 5000);
    }

    inicializar() {
        console.log('💰 Pantalla de CAJA iniciada correctamente');
    }

    async cargarOrdenes() {
        if (this.cargando) return;
        this.cargando = true;
        
        try {
            console.log('🔄 Caja: Cargando órdenes...');
            const response = await fetch(this.baseURL + '/ordenes');
            
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('✅ Caja: Recibidas', data.ordenes?.length, 'órdenes');
            
            if (data.success && Array.isArray(data.ordenes)) {
                this.ordenes = data.ordenes;
                this.mostrarOrdenes();
                this.actualizarEstadisticas();
            }
            
        } catch (error) {
            console.error('❌ Caja - Error:', error.message);
        } finally {
            this.cargando = false;
        }
    }

    mostrarOrdenes() {
        const contenedor = document.getElementById('ordenes-caja');
        
        console.log('💰 Mostrando', this.ordenes.length, 'órdenes en caja');

        if (this.ordenes.length === 0) {
            contenedor.innerHTML = `
                <div class="no-orders-message">
                    <h3>💰 Sin órdenes pendientes</h3>
                    <p>No hay órdenes para cobrar en este momento</p>
                    <p>Última actualización: ${new Date().toLocaleTimeString()}</p>
                </div>
            `;
            return;
        }

        contenedor.innerHTML = this.ordenes.map(orden => {
            const items = orden.items_descripcion ? orden.items_descripcion.split(',') : ['Sin items'];
            
            return `
                <div class="caja-order">
                    <div class="order-header">
                        <div class="mesa-info">
                            <div class="mesa-number">MESA ${orden.mesa}</div>
                            <div class="order-id">Orden #${orden.id}</div>
                        </div>
                        <div class="order-time">
                            ${new Date(orden.creado_en).toLocaleTimeString()}
                        </div>
                    </div>
                    
                    <div class="order-details">
                        <div class="detail-section">
                            <h3>📋 Items:</h3>
                            <ul class="items-list">
                                ${items.map(item => `
                                    <li>${item.trim()}</li>
                                `).join('')}
                            </ul>
                        </div>
                        
                        <div class="detail-section total-section">
                            <h3>💰 Total a Cobrar</h3>
                            <div class="total-amount">$${orden.total.toFixed(2)}</div>
                            <div class="order-status">${orden.estado}</div>
                        </div>
                    </div>
                    
                    <div class="order-actions">
                        <button class="btn btn-cobrar" onclick="caja.cobrarOrden(${orden.id})">
                            💳 Cobrar $${orden.total.toFixed(2)}
                        </button>
                        <button class="btn btn-factura" onclick="caja.generarFactura(${orden.id})">
                            🧾 Factura
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    actualizarEstadisticas() {
        const total = this.ordenes.reduce((sum, orden) => sum + (orden.total || 0), 0);
        document.getElementById('total-cobrar').textContent = 
            `$${total.toFixed(2)} por cobrar (${this.ordenes.length} órdenes)`;
    }

    cobrarOrden(ordenId) {
        const orden = this.ordenes.find(o => o.id === ordenId);
        if (orden) {
            alert(`💰 Orden #${ordenId} cobrada - $${orden.total.toFixed(2)}`);
        }
    }

    generarFactura(ordenId) {
        const orden = this.ordenes.find(o => o.id === ordenId);
        if (orden) {
            const factura = `
FACTURA - Café Tech
Orden: #${orden.id} | Mesa: ${orden.mesa}
${new Date().toLocaleString()}

${orden.items_descripcion.split(',').map(item => item.trim()).join('\n')}

TOTAL: $${orden.total.toFixed(2)}

¡Gracias por su visita! ☕
            `;
            alert('Factura:\n\n' + factura);
        }
    }
}

// Inicializar caja
console.log('📝 Registrando caja...');
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎉 DOM cargado - Iniciando caja...');
    window.caja = new CajaDisplay();
});
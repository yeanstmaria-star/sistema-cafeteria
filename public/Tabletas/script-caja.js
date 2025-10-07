// script-caja.js - VERSIÓN SIMPLIFICADA Y ROBUSTA
console.log('💰 script-caja.js CARGADO - Iniciando caja...');

class CajaDisplay {
    constructor() {
        this.ordenes = [];
        this.baseURL = window.location.origin;
        console.log('💰 Caja conectada a:', this.baseURL);
        
        this.inicializar();
        this.cargarOrdenes();
        setInterval(() => this.cargarOrdenes(), 3000);
    }

    inicializar() {
        console.log('💰 Pantalla de CAJA iniciada correctamente');
    }

    async cargarOrdenes() {
        try {
            console.log('🔄 Cargando órdenes para caja...');
            const response = await fetch(this.baseURL + '/ordenes');
            
            console.log('📡 Response status:', response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP Error: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('✅ Datos recibidos en caja:', data);
            
            if (data.success && Array.isArray(data.ordenes)) {
                this.ordenes = data.ordenes;
                this.mostrarOrdenes();
                this.actualizarEstadisticas();
            } else {
                throw new Error('Formato de datos inválido');
            }
            
        } catch (error) {
            console.error('❌ Error en caja:', error);
            this.mostrarError('Error: ' + error.message);
        }
    }

    mostrarOrdenes() {
        const contenedor = document.getElementById('ordenes-caja');
        
        console.log('💰 Mostrando', this.ordenes.length, 'órdenes en caja');

        if (this.ordenes.length === 0) {
            contenedor.innerHTML = '<div class="no-orders">No hay órdenes pendientes</div>';
            return;
        }

        contenedor.innerHTML = this.ordenes.map(orden => {
            const items = orden.items_descripcion ? orden.items_descripcion.split(',') : ['No items'];
            
            return `
                <div class="caja-order">
                    <div class="order-header">
                        <div class="mesa-number">MESA ${orden.mesa}</div>
                        <div class="order-id">#${orden.id}</div>
                    </div>
                    
                    <div class="order-details">
                        <div class="items-list">
                            <h4>📋 Items:</h4>
                            ${items.map(item => `<div class="item">${item.trim()}</div>`).join('')}
                        </div>
                        
                        <div class="total-section">
                            <div class="total-amount">$${orden.total}</div>
                            <div class="order-status">${orden.estado}</div>
                        </div>
                    </div>
                    
                    <div class="order-actions">
                        <button class="btn btn-cobrar" onclick="caja.cobrarOrden(${orden.id})">
                            💳 Cobrar $${orden.total}
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
            alert(`💰 Cobrando orden #${ordenId} - Total: $${orden.total}`);
        }
    }

    mostrarError(mensaje) {
        const contenedor = document.getElementById('ordenes-caja');
        contenedor.innerHTML = `
            <div class="error-message">
                <h3>⚠️ Error en Caja</h3>
                <p>${mensaje}</p>
                <button onclick="location.reload()" class="btn">🔄 Recargar</button>
            </div>
        `;
    }
}

// Inicializar caja
console.log('📝 Registrando caja...');
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎉 DOM cargado - Iniciando caja...');
    window.caja = new CajaDisplay();
});
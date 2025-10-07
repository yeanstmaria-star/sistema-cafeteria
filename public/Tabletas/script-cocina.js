// script-cocina.js - VERSIÓN SIMPLIFICADA Y ROBUSTA
console.log('🚀 script-cocina.js CARGADO - Iniciando cocina...');

class CocinaDisplay {
    constructor() {
        this.ordenes = [];
        this.baseURL = window.location.origin;
        console.log('👨‍🍳 Cocina conectada a:', this.baseURL);
        
        this.inicializar();
        this.cargarOrdenes();
        // Actualizar cada 3 segundos
        setInterval(() => this.cargarOrdenes(), 3000);
    }

    inicializar() {
        console.log('👨‍🍳 Pantalla de COCINA iniciada correctamente');
        document.getElementById('ordenes-pendientes').textContent = 'Cargando...';
    }

    async cargarOrdenes() {
        try {
            console.log('🔄 Intentando cargar órdenes...');
            const response = await fetch(this.baseURL + '/ordenes');
            
            console.log('📡 Response status:', response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP Error: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('✅ Datos recibidos:', data);
            
            if (data.success && Array.isArray(data.ordenes)) {
                this.ordenes = data.ordenes;
                this.mostrarOrdenes();
                this.actualizarEstadisticas();
                console.log('🎉 Órdenes mostradas correctamente');
            } else {
                throw new Error('Formato de datos inválido');
            }
            
        } catch (error) {
            console.error('❌ Error cargando órdenes:', error);
            this.mostrarError('Error: ' + error.message);
        }
    }

    mostrarOrdenes() {
        const contenedor = document.getElementById('ordenes-cocina');
        const noOrders = document.getElementById('no-orders');
        
        console.log('📊 Mostrando', this.ordenes.length, 'órdenes');

        // Filtrar órdenes con alimentos
        const ordenesConAlimentos = this.ordenes.filter(orden => {
            return orden.items_descripcion && (
                orden.items_descripcion.includes('Croissant') ||
                orden.items_descripcion.includes('Galleta') ||
                orden.items_descripcion.includes('Sándwich') ||
                orden.items_descripcion.includes('Bagel') ||
                orden.items_descripcion.includes('Ensalada')
            );
        });

        console.log('🍽️ Órdenes con alimentos:', ordenesConAlimentos.length);

        if (ordenesConAlimentos.length === 0) {
            contenedor.innerHTML = `
                <div class="no-orders-message">
                    <h3>🍽️ No hay órdenes para cocina</h3>
                    <p>Las órdenes actuales son solo de bebidas</p>
                    <p><em>Las bebidas se preparan en la barra</em></p>
                </div>
            `;
            return;
        }

        contenedor.innerHTML = ordenesConAlimentos.map(orden => {
            const alimentos = orden.items_descripcion.split(',').filter(item => 
                item.includes('Croissant') || item.includes('Galleta') || 
                item.includes('Sándwich') || item.includes('Bagel') || 
                item.includes('Ensalada')
            );

            return `
                <div class="kitchen-order">
                    <div class="order-header">
                        <div class="mesa-number">MESA ${orden.mesa}</div>
                        <div class="order-id">#${orden.id}</div>
                    </div>
                    <div class="order-time">${new Date(orden.creado_en).toLocaleTimeString()}</div>
                    
                    <div class="food-items">
                        ${alimentos.map(item => `
                            <div class="food-item">${item.trim()}</div>
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
            orden.items_descripcion && (
                orden.items_descripcion.includes('Croissant') ||
                orden.items_descripcion.includes('Galleta') ||
                orden.items_descripcion.includes('Sándwich')
            )
        );
        
        document.getElementById('ordenes-pendientes').textContent = 
            `${ordenesConAlimentos.length} órdenes de alimentos`;
    }

    marcarPreparando(ordenId) {
        alert(`👨‍🍳 Preparando orden #${ordenId}`);
    }

    marcarListo(ordenId) {
        alert(`✅ Orden #${ordenId} lista`);
    }

    mostrarError(mensaje) {
        const contenedor = document.getElementById('ordenes-cocina');
        contenedor.innerHTML = `
            <div class="error-message">
                <h3>⚠️ Error de Conexión</h3>
                <p>${mensaje}</p>
                <button onclick="location.reload()" class="btn">🔄 Recargar</button>
            </div>
        `;
    }
}

// Inicializar cuando el DOM esté listo
console.log('📝 Registrando event listener...');
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎉 DOM cargado - Iniciando cocina...');
    window.cocina = new CocinaDisplay();
});

console.log('✅ script-cocina.js terminado de cargar');
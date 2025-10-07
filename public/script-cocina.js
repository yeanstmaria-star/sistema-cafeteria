// script-cocina.js - VERSIÓN ESTABLE SIN CICLOS DE ERROR
console.log('🚀 script-cocina.js CARGADO - Iniciando cocina...');

class CocinaDisplay {
    constructor() {
        this.ordenes = [];
        this.baseURL = window.location.origin;
        this.cargando = false;
        
        console.log('👨‍🍳 Cocina conectada a:', this.baseURL);
        
        this.inicializar();
        this.cargarOrdenes();
        // Actualizar cada 5 segundos (no muy rápido)
        setInterval(() => this.cargarOrdenes(), 5000);
    }

    inicializar() {
        console.log('👨‍🍳 Pantalla de COCINA iniciada correctamente');
        document.getElementById('ordenes-pendientes').textContent = 'Conectando...';
    }

    async cargarOrdenes() {
        // Evitar múltiples llamadas simultáneas
        if (this.cargando) {
            console.log('⏳ Ya está cargando, esperando...');
            return;
        }
        
        this.cargando = true;
        
        try {
            console.log('🔄 Cargando órdenes...');
            const response = await fetch(this.baseURL + '/ordenes');
            
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('✅ API respondió con', data.ordenes?.length, 'órdenes');
            
            if (data.success && Array.isArray(data.ordenes)) {
                this.ordenes = data.ordenes;
                this.mostrarOrdenes();
                this.actualizarEstadisticas();
            } else {
                console.warn('⚠️ Formato de datos inesperado:', data);
            }
            
        } catch (error) {
            console.error('❌ Error cargando órdenes:', error.message);
            // NO mostrar error en pantalla para evitar ciclos
            this.mostrarMensajeTemporal('⏳ Reconectando...');
        } finally {
            this.cargando = false;
        }
    }

    mostrarOrdenes() {
        const contenedor = document.getElementById('ordenes-cocina');
        const noOrders = document.getElementById('no-orders');
        
        console.log('📊 Procesando', this.ordenes.length, 'órdenes totales');

        // Filtrar órdenes con alimentos - MÉTODO MEJORADO
        const ordenesConAlimentos = this.ordenes.filter(orden => {
            if (!orden.items_descripcion) return false;
            
            const items = orden.items_descripcion.toLowerCase();
            const tieneAlimentos = items.includes('croissant') || 
                                  items.includes('galleta') || 
                                  items.includes('sándwich') || 
                                  items.includes('sandwich') ||
                                  items.includes('bagel') || 
                                  items.includes('ensalada');
            
            return tieneAlimentos;
        });

        console.log('🍽️ Encontradas', ordenesConAlimentos.length, 'órdenes con alimentos');

        if (ordenesConAlimentos.length === 0) {
            // MOSTRAR MENSAJE INFORMATIVO, NO ERROR
            contenedor.innerHTML = `
                <div class="no-orders-message">
                    <h3>✅ Estado: Sin órdenes para cocina</h3>
                    <p>• Las órdenes actuales son de bebidas (barra)</p>
                    <p>• Los alimentos aparecerán aquí automáticamente</p>
                    <p>• Última actualización: ${new Date().toLocaleTimeString()}</p>
                </div>
            `;
            contenedor.classList.remove('hidden');
            noOrders.classList.add('hidden');
            return;
        }

        contenedor.classList.remove('hidden');
        noOrders.classList.add('hidden');

        contenedor.innerHTML = ordenesConAlimentos.map(orden => {
            // Extraer solo alimentos
            const todosItems = orden.items_descripcion.split(',');
            const alimentos = todosItems.filter(item => {
                const itemLower = item.toLowerCase().trim();
                return itemLower.includes('croissant') || 
                       itemLower.includes('galleta') || 
                       itemLower.includes('sándwich') ||
                       itemLower.includes('sandwich') ||
                       itemLower.includes('bagel') || 
                       itemLower.includes('ensalada');
            });

            return `
                <div class="kitchen-order">
                    <div class="order-header">
                        <div>
                            <div class="mesa-number">MESA ${orden.mesa}</div>
                            <div class="order-id">#${orden.id}</div>
                        </div>
                        <div class="order-time">${new Date(orden.creado_en).toLocaleTimeString()}</div>
                    </div>
                    
                    <div class="order-info">
                        <div class="total">Total: $${orden.total}</div>
                        <div class="estado">${orden.estado}</div>
                    </div>
                    
                    <div class="food-items">
                        <h4>🍽️ Alimentos:</h4>
                        ${alimentos.map(item => `
                            <div class="food-item">
                                <span class="item-name">${item.trim()}</span>
                            </div>
                        `).join('')}
                    </div>

                    <div class="all-items">
                        <details>
                            <summary>📋 Orden completa</summary>
                            ${todosItems.map(item => `
                                <div class="item-completo ${alimentos.includes(item) ? 'es-alimento' : 'es-bebida'}">
                                    ${item.trim()}
                                </div>
                            `).join('')}
                        </details>
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
                orden.items_descripcion.toLowerCase().includes('croissant') ||
                orden.items_descripcion.toLowerCase().includes('galleta') ||
                orden.items_descripcion.toLowerCase().includes('sándwich') ||
                orden.items_descripcion.toLowerCase().includes('sandwich')
            )
        );
        
        const texto = ordenesConAlimentos.length > 0 
            ? `${ordenesConAlimentos.length} órdenes de alimentos`
            : 'Esperando órdenes con alimentos';
            
        document.getElementById('ordenes-pendientes').textContent = texto;
    }

    marcarPreparando(ordenId) {
        console.log(`👨‍🍳 Preparando orden #${ordenId}`);
        alert(`¡Comenzando a preparar orden #${ordenId}!`);
    }

    marcarListo(ordenId) {
        console.log(`✅ Orden #${ordenId} lista`);
        alert(`¡Orden #${ordenId} LISTA para servir!`);
    }

    mostrarMensajeTemporal(mensaje) {
        // Mensaje temporal que no interfiere con el ciclo
        console.log('💬', mensaje);
    }
}

// Inicialización segura
console.log('📝 Registrando cocina...');
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎉 DOM cargado - Iniciando cocina...');
    window.cocina = new CocinaDisplay();
});
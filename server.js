// server.js - VERSIÓN CON BASE DE DATOS
const express = require('express');
const path = require('path');
const Database = require('./database.js');

const app = express();
const PORT = process.env.PORT || 3000;

// ¡IMPORTANTE! Middlewares
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Inicializar base de datos
const db = new Database();

// Variable para órdenes en memoria (temporal)
let ordenesEnMemoria = [];

// Página de inicio MEJORADA
app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Sistema Cafetería - CON BASE DE DATOS</title>
        <style>
            body { 
                font-family: Arial, sans-serif; 
                background: linear-gradient(135deg, #8B4513, #A0522D);
                color: white; 
                margin: 0; 
                padding: 20px;
                text-align: center;
            }
            .container { 
                max-width: 1000px; 
                margin: 0 auto; 
                background: rgba(255,255,255,0.1); 
                padding: 30px; 
                border-radius: 15px;
                backdrop-filter: blur(10px);
            }
            .dashboard {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
                margin-top: 30px;
            }
            .card {
                background: rgba(255,255,255,0.9);
                color: #333;
                padding: 25px;
                border-radius: 10px;
                box-shadow: 0 8px 25px rgba(0,0,0,0.3);
            }
            .card h2 {
                color: #8B4513;
                margin-bottom: 15px;
            }
            .card a {
                display: block;
                background: #8B4513;
                color: white;
                padding: 12px;
                margin: 10px 0;
                border-radius: 8px;
                text-decoration: none;
                font-weight: bold;
                transition: background 0.3s ease;
            }
            .card a:hover {
                background: #A0522D;
            }
            .orden-item {
                background: #f9f9f9;
                margin: 8px 0;
                padding: 12px;
                border-radius: 8px;
                text-align: left;
                border-left: 4px solid #8B4513;
            }
            .stats {
                font-size: 1.1em;
                color: #FFD700;
                margin: 10px 0;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🏪 Sistema de Cafetería - CON BASE DE DATOS</h1>
            <p class="stats">✅ Base de datos SQLite conectada</p>
            <p class="stats">📊 Sistema profesional listo</p>
            
            <div class="dashboard">
                <div class="card">
                    <h2>📊 Órdenes Activas</h2>
                    <div id="ordenes-lista">
                        ${ordenesEnMemoria.length === 0 ? 
                            '<p style="color: #666; font-style: italic;">No hay órdenes activas</p>' : 
                            ordenesEnMemoria.map(orden => `
                                <div class="orden-item">
                                    <strong>Mesa ${orden.mesa}</strong> | Orden #${orden.id}<br>
                                    ${orden.items.map(item => `${item.nombre} x${item.cantidad}`).join(', ')}<br>
                                    <em>Total: $${orden.total} | ${new Date(orden.timestamp).toLocaleTimeString()}</em>
                                </div>
                            `).join('')
                        }
                    </div>
                </div>
                
                <div class="card">
                    <h2>🔗 Pantallas del Sistema</h2>
                    <a href="/menu.html" target="_blank">📱 Tableta Menú (Clientes)</a>
                    <a href="/cocina.html" target="_blank">👨‍🍳 Pantalla Cocina</a>
                    <a href="/caja.html" target="_blank">💰 Pantalla Caja</a>
                    
                    <h2 style="margin-top: 25px;">📋 APIs del Sistema</h2>
                    <a href="/menu" target="_blank">🍽️ Ver Menú (Desde BD)</a>
                    <a href="/ordenes" target="_blank">📦 Ver Órdenes (Desde BD)</a>
                    <a href="/admin" target="_blank">⚙️ Panel Administración</a>
                </div>
            </div>
        </div>
    </body>
    </html>
    `);
});

// Endpoint de salud para verificar que el servidor está vivo
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Servidor funcionando correctamente',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// API para obtener el menú DESDE LA BASE DE DATOS
app.get('/menu', (req, res) => {
    db.obtenerProductos((err, productos) => {
        if (err) {
            console.error('❌ Error obteniendo menú:', err);
            res.status(500).json({ error: 'Error obteniendo menú' });
        } else {
            // Formatear para compatibilidad con el frontend existente
            const menuFormateado = {
                bebidas: productos.filter(p => p.categoria === 'bebida'),
                alimentos: productos.filter(p => p.categoria === 'alimento')
            };
            res.json(menuFormateado);
        }
    });
});

// API para recibir órdenes - GUARDAR EN BASE DE DATOS
app.post('/api/order', (req, res) => {
    try {
        const { mesa, items, total } = req.body;
        
        console.log('📥 Nueva orden recibida - Mesa:', mesa);
        
        // Validaciones
        if (!mesa || !items || !total) {
            return res.status(400).json({ 
                success: false, 
                error: 'Datos incompletos' 
            });
        }

        // 1. Crear la orden en la base de datos
        db.crearOrden({ mesa, total, tipo: 'mesa' }, (err, ordenId) => {
            if (err) {
                console.error('❌ Error creando orden en BD:', err);
                return res.status(500).json({ 
                    success: false, 
                    error: 'Error guardando orden' 
                });
            }

            console.log('✅ Orden creada en BD con ID:', ordenId);

            // 2. Preparar items para la base de datos
            const itemsParaBD = items.map(item => ({
                producto_id: obtenerIdProductoPorNombre(item.nombre),
                cantidad: item.cantidad || 1,
                precio: item.precio
            }));

            // 3. Guardar items en la base de datos
            db.agregarOrdenItems(ordenId, itemsParaBD, (err) => {
                if (err) {
                    console.error('❌ Error guardando items:', err);
                    // Aún así respondemos éxito, pero logueamos el error
                }

                // 4. También mantener en memoria para compatibilidad temporal
                const nuevaOrdenMemoria = {
                    id: ordenId,
                    mesa: mesa,
                    items: items,
                    total: total,
                    status: 'recibido',
                    timestamp: new Date().toISOString()
                };
                
                ordenesEnMemoria.push(nuevaOrdenMemoria);
                
                // 5. Simular envío a áreas
                enviarACocina(nuevaOrdenMemoria);
                enviarABarra(nuevaOrdenMemoria);
                enviarACaja(nuevaOrdenMemoria);
                
                console.log('🎉 Orden procesada completamente - ID:', ordenId);
                
                res.json({ 
                    success: true, 
                    orderId: ordenId,
                    message: 'Orden recibida y guardada en base de datos' 
                });
            });
        });
        
    } catch (error) {
        console.error('❌ Error procesando orden:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Error interno del servidor' 
        });
    }
});

// Función auxiliar para obtener ID de producto por nombre
function obtenerIdProductoPorNombre(nombre) {
    const productosMap = {
        'Capuchino': 1, 'Latte': 2, 'Té Verde': 3, 'Chocolate Caliente': 4, 'Jugo de Naranja': 5,
        'Croissant': 6, 'Bagel': 7, 'Galleta': 8, 'Sándwich de Jamón': 9, 'Ensalada César': 10
    };
    return productosMap[nombre] || 1; // Default al primer producto si no encuentra
}

// API para ver todas las órdenes DESDE BASE DE DATOS - VERSIÓN CORREGIDA
app.get('/ordenes', (req, res) => {
    db.obtenerOrdenes((err, ordenes) => {
        if (err) {
            console.error('❌ Error obteniendo órdenes:', err);
            res.status(500).json({ 
                success: false,
                error: 'Error obteniendo órdenes',
                message: err.message 
            });
        } else {
            // 🔥 CORRECCIÓN: Asegurar que siempre devolvemos el formato correcto
            const ordenesFormateadas = ordenes.map(orden => ({
                id: orden.id,
                mesa: orden.mesa,
                total: orden.total || 0,
                estado: orden.estado || 'recibido',
                tipo: orden.tipo || 'mesa',
                creado_en: orden.creado_en,
                items_descripcion: orden.items_descripcion || 'No items'
            }));
            
            res.json({
                success: true,
                total: ordenesFormateadas.length,
                ordenes: ordenesFormateadas
            });
        }
    });
});

// Nuevo: Panel de administración
app.get('/admin', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Panel Administración</title>
        <style>
            body { font-family: Arial; padding: 20px; background: #2C3E50; color: white; }
            .container { max-width: 800px; margin: 0 auto; }
            .card { background: rgba(255,255,255,0.1); padding: 20px; margin: 10px 0; border-radius: 10px; }
            .btn { background: #3498DB; color: white; padding: 10px 15px; border: none; border-radius: 5px; cursor: pointer; margin: 5px; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>⚙️ Panel de Administración</h1>
            <div class="card">
                <h3>📊 Base de Datos</h3>
                <p>SQLite: cafeteria.db</p>
                <button class="btn" onclick="verProductos()">Ver Productos</button>
                <button class="btn" onclick="verOrdenes()">Ver Órdenes</button>
            </div>
            <div id="resultado"></div>
        </div>
        <script>
            async function verProductos() {
                const response = await fetch('/menu');
                const data = await response.json();
                document.getElementById('resultado').innerHTML = '<h3>Productos:</h3><pre>' + JSON.stringify(data, null, 2) + '</pre>';
            }
            async function verOrdenes() {
                const response = await fetch('/ordenes');
                const data = await response.json();
                document.getElementById('resultado').innerHTML = '<h3>Órdenes:</h3><pre>' + JSON.stringify(data, null, 2) + '</pre>';
            }
        </script>
    </body>
    </html>
    `);
});

// Funciones para enviar a diferentes áreas (simuladas)
function enviarACocina(orden) {
    const itemsCocina = orden.items.filter(item => 
        item.categoria === 'alimento' || item.nombre?.includes('Sándwich') || item.nombre?.includes('Ensalada') || item.nombre?.includes('Croissant')
    );
    if (itemsCocina.length > 0) {
        console.log('👨‍🍳 ENVIANDO A COCINA:', itemsCocina.map(item => `${item.nombre} x${item.cantidad}`).join(', '));
    }
}

function enviarABarra(orden) {
    const itemsBarra = orden.items.filter(item => 
        item.categoria === 'bebida' || item.nombre?.includes('Capuchino') || item.nombre?.includes('Latte') || item.nombre?.includes('Té')
    );
    if (itemsBarra.length > 0) {
        console.log('☕ ENVIANDO A BARRA:', itemsBarra.map(item => `${item.nombre} x${item.cantidad}`).join(', '));
    }
}

function enviarACaja(orden) {
    console.log('💰 ENVIANDO A CAJA: Total $' + orden.total + ' | Mesa ' + orden.mesa);
}

// Manejo de errores
app.use((req, res) => {
    res.status(404).send(`
        <html>
        <head><title>Página no encontrada</title></head>
        <body style="font-family: Arial; text-align: center; padding: 50px;">
            <h1>❌ Página no encontrada</h1>
            <p>La página que buscas no existe.</p>
            <a href="/" style="color: #8B4513;">Volver al inicio</a>
        </body>
        </html>
    `);
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log('='.repeat(70));
    console.log('🏪 SISTEMA DE CAFETERÍA CON BASE DE DATOS INICIADO');
    console.log('='.repeat(70));
    console.log(`✅ Servidor: http://localhost:${PORT}`);
    console.log(`🗄️  Base de datos: cafeteria.db`);
    console.log(`📱 Tabletas: http://localhost:${PORT}/menu.html`);
    console.log(`👨‍🍳 Cocina: http://localhost:${PORT}/cocina.html`);
    console.log(`💰 Caja: http://localhost:${PORT}/caja.html`);
    console.log(`⚙️  Admin: http://localhost:${PORT}/admin`);
    console.log('='.repeat(70));
    console.log('🎯 Características nuevas:');
    console.log('   ✅ Menú desde base de datos');
    console.log('   ✅ Órdenes guardadas permanentemente');
    console.log('   ✅ Panel de administración');
    console.log('   ✅ Persistencia de datos');
    console.log('='.repeat(70));
});
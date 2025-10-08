// server.js - VERSIÓN COMPLETA CORREGIDA CON ASISTENTE IA Y LLAMADAS
const express = require('express');
const path = require('path');
const Database = require('./database.js');
const AsistenteCafeteria = require('./AsistenteIA.js');

// Crear instancia del asistente
const asistente = new AsistenteCafeteria();

const app = express();
const PORT = process.env.PORT || 3000;

// ¡IMPORTANTE! Middlewares
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Inicializar base de datos
const db = new Database();

// Variable para órdenes en memoria (temporal)
let ordenesEnMemoria = [];

// ==================== 🌐 RUTAS PRINCIPALES ====================

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
                    <a href="/bebidas.html" target="_blank">🍹 Barra de Bebidas</a>
                    
                    <h2 style="margin-top: 25px;">🤖 Asistente IA</h2>
                    <a href="/asistente-simple" target="_blank">🎤 Asistente Simple</a>
                    <a href="/asistente-demo" target="_blank">💬 Asistente Demo</a>
                    <a href="/llamadas-demo" target="_blank">📞 Simulador Llamadas</a>
                    <a href="/asistente/menu" target="_blank">📋 Menú del Asistente</a>
                    
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

// Webhook que recibe llamadas de Twilio - VERSIÓN MEJORADA
app.post('/twilio/llamada', express.urlencoded({ extended: false }), async (req, res) => {
    try {
        console.log('📞 Llamada entrante de Twilio:', req.body);
        
        // Detectar si es el inicio de la llamada o una respuesta
        const esInicioLlamada = !req.body.SpeechResult;
        const mensajeCliente = req.body.SpeechResult || '';
        const numeroCliente = req.body.From || 'Desconocido';
        
        if (esInicioLlamada) {
            console.log('📞 Iniciando nueva llamada desde:', numeroCliente);
            
            // ✅ CONFIGURACIÓN CORRECTA: Usar Gather con speech, no digits
            const respuestaInicial = `
                <?xml version="1.0" encoding="UTF-8"?>
                <Response>
                    <Say voice="alice" language="es-ES">
                        ¡Bienvenido a Café Tech! Soy su asistente virtual. 
                        Por favor, dígame qué le gustaría ordenar después del tono.
                    </Say>
                    <Gather 
                        input="speech" 
                        action="/twilio/llamada" 
                        method="POST" 
                        language="es-ES"
                        timeout="5"
                        speechTimeout="auto">
                        <Say voice="alice" language="es-ES">
                            Estoy escuchando...
                        </Say>
                    </Gather>
                    <!-- Si no hay respuesta, repetir -->
                    <Say voice="alice" language="es-ES">
                        No le escuché. Por favor, llame de nuevo. ¡Gracias!
                    </Say>
                    <Hangup/>
                </Response>
            `;
            
            res.type('text/xml');
            return res.send(respuestaInicial);
        }
        
        // Si ya tenemos un mensaje del cliente
        console.log(`🎤 Cliente ${numeroCliente} dijo: "${mensajeCliente}"`);
        
        // Procesar con el asistente IA
        const resultado = await asistente.procesarPedido(mensajeCliente);
        
        console.log('🤖 Asistente respondió:', resultado.respuesta);
        
        let respuestaTwilio = `
            <?xml version="1.0" encoding="UTF-8"?>
            <Response>
                <Say voice="alice" language="es-ES">${resultado.respuesta}</Say>
        `;
        
        // Si hay pedido, confirmar y crear orden
        if (resultado.tienePedido && resultado.items.length > 0) {
            console.log('📦 Creando orden desde llamada...');
            
            // Crear orden en el sistema
            db.crearOrden({ mesa: 'telefono', total: resultado.total, tipo: 'llamada' }, (err, ordenId) => {
                if (err) {
                    console.error('❌ Error creando orden:', err);
                } else {
                    console.log('✅ Orden creada desde llamada:', ordenId);
                    
                    // Preparar items
                    const itemsParaBD = resultado.items.map(item => ({
                        producto_id: obtenerIdProductoPorNombre(item.nombre),
                        cantidad: item.cantidad || 1,
                        precio: item.precio
                    }));

                    db.agregarOrdenItems(ordenId, itemsParaBD, () => {
                        // Simular envío a áreas
                        const ordenSimulada = {
                            id: ordenId,
                            mesa: 'Telefono',
                            items: resultado.items,
                            total: resultado.total,
                            status: 'recibido',
                            timestamp: new Date().toISOString()
                        };
                        
                        enviarACocina(ordenSimulada);
                        enviarABarra(ordenSimulada);
                        enviarACaja(ordenSimulada);
                    });
                }
            });
            
            respuestaTwilio += `
                <Say voice="alice" language="es-ES">
                    He creado su orden en el sistema. Su pedido estará listo en 10 minutos. 
                    ¡Gracias por su llamada!
                </Say>
                <Hangup/>
            </Response>
            `;
        } else {
            // Si no hay pedido, dar otra oportunidad
            respuestaTwilio += `
                <Gather 
                    input="speech" 
                    action="/twilio/llamada" 
                    method="POST" 
                    language="es-ES"
                    timeout="5">
                    <Say voice="alice" language="es-ES">
                        ¿Algo más en lo que pueda ayudarle? Por ejemplo, puede pedir: 
                        un capuchino, un latte, un té, o un croissant.
                    </Say>
                </Gather>
                <Say voice="alice" language="es-ES">
                    No le escuché. Si necesita ayuda, por favor llame de nuevo. ¡Gracias!
                </Say>
                <Hangup/>
            </Response>
            `;
        }
        
        res.type('text/xml');
        res.send(respuestaTwilio);
        
    } catch (error) {
        console.error('💥 Error en webhook Twilio:', error);
        const errorResponse = `
            <?xml version="1.0" encoding="UTF-8"?>
            <Response>
                <Say voice="alice" language="es-ES">
                    Lo siento, estoy teniendo problemas técnicos en este momento. 
                    Por favor, llame más tarde o visite nuestra cafetería. ¡Gracias!
                </Say>
                <Hangup/>
            </Response>
        `;
        res.type('text/xml');
        res.send(errorResponse);
    }
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
                <button class="btn" onclick="probarAsistente()">Probar Asistente IA</button>
                <button class="btn" onclick="probarLlamadas()">Probar Llamadas</button>
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
            async function probarAsistente() {
                const response = await fetch('/asistente');
                const data = await response.json();
                document.getElementById('resultado').innerHTML = '<h3>Asistente IA:</h3><pre>' + JSON.stringify(data, null, 2) + '</pre>';
            }
            async function probarLlamadas() {
                window.open('/llamadas-demo', '_blank');
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
    console.log('🏪 SISTEMA DE CAFETERÍA CON ASISTENTE IA INICIADO');
    console.log('='.repeat(70));
    console.log(`✅ Servidor: http://localhost:${PORT}`);
    console.log(`🗄️  Base de datos: cafeteria.db`);
    console.log(`🤖 Asistente IA: http://localhost:${PORT}/asistente`);
    console.log(`📱 Tabletas: http://localhost:${PORT}/menu.html`);
    console.log(`👨‍🍳 Cocina: http://localhost:${PORT}/cocina.html`);
    console.log(`🍹 Barra: http://localhost:${PORT}/bebidas.html`);
    console.log(`💰 Caja: http://localhost:${PORT}/caja.html`);
    console.log(`📞 Llamadas: http://localhost:${PORT}/llamadas-demo`);
    console.log(`⚙️  Admin: http://localhost:${PORT}/admin`);
    console.log('='.repeat(70));
    console.log('🎯 Características:');
    console.log('   ✅ Menú desde base de datos');
    console.log('   ✅ Órdenes guardadas permanentemente');
    console.log('   ✅ Asistente IA con Google Gemini');
    console.log('   ✅ Sistema de llamadas telefónicas');
    console.log('   ✅ Panel de administración');
    console.log('='.repeat(70));
});
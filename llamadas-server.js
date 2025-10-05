// llamadas-server.js - VERSIÓN CORREGIDA
const express = require('express');
const twilio = require('twilio');
const AsistenteSimulado = require('./asistente-simulado.js');

const app = express();
const PORT = 3001;

// ⚠️ CONFIGURA ESTOS DATOS CON TUS CREDENCIALES DE TWILIO ⚠️
const TWILIO_ACCOUNT_SID = 'AC_tu_account_sid_aqui';
const TWILIO_AUTH_TOKEN = 'tu_auth_token_aqui';
const TWILIO_PHONE_NUMBER = '+1234567890';

const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
const asistente = new AsistenteSimulado();

// 🔥🔥🔥 CORRECCIÓN: Agregar body-parser para JSON 🔥🔥🔥
app.use(express.urlencoded({ extended: false }));
app.use(express.json()); // ¡ESTA LÍNEA FALTABA!

// Ruta para cuando alguien LLAMA a nuestro número Twilio
app.post('/llamada/entrante', (req, res) => {
    console.log('📞 ¡LLAMADA ENTRANTE RECIBIDA!');
    
    const twiml = new twilio.twiml.VoiceResponse();
    
    twiml.say('¡Bienvenido a Café Tech! Soy su asistente virtual. ¿Qué le gustaría ordenar hoy?');
    
    twiml.gather({
        input: 'speech',
        timeout: 10,
        action: '/llamada/procesar',
        method: 'POST'
    });
    
    twiml.say('No le escuché, por favor intente de nuevo.');
    twiml.redirect('/llamada/entrante');
    
    res.type('text/xml');
    res.send(twiml.toString());
});

// Ruta para procesar lo que dijo el cliente
app.post('/llamada/procesar', async (req, res) => {
    const speechResult = req.body.SpeechResult;
    console.log('🎙️  Cliente dijo por teléfono:', speechResult);
    
    const twiml = new twilio.twiml.VoiceResponse();
    
    if (speechResult) {
        const resultado = asistente.procesarPedido(speechResult);
        
        twiml.say(resultado.respuesta);
        
        if (resultado.tienePedido) {
            await enviarOrdenASistema(resultado);
            twiml.say('Su orden ha sido enviada a cocina. ¡Gracias por su pedido!');
        } else {
            twiml.say('¿Algo más que le gustaría ordenar?');
            twiml.gather({
                input: 'speech',
                timeout: 10,
                action: '/llamada/procesar',
                method: 'POST'
            });
        }
    } else {
        twiml.say('No le escuché bien, por favor repita su pedido.');
        twiml.redirect('/llamada/entrante');
    }
    
    twiml.say('¡Que tenga un excelente día!');
    twiml.hangup();
    
    res.type('text/xml');
    res.send(twiml.toString());
});

// Función para enviar la orden al sistema principal
async function enviarOrdenASistema(orden) {
    try {
        console.log('📤 Enviando orden a sistema principal...');
        
        const ordenParaSistema = {
            mesa: 99,
            items: orden.items,
            total: orden.total,
            tipo: 'telefono'
        };
        
        const response = await fetch('http://localhost:3000/api/order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(ordenParaSistema)
        });
        
        if (response.ok) {
            console.log('✅ Orden telefónica enviada correctamente a cocina/caja');
        } else {
            console.log('❌ Error enviando orden telefónica');
        }
    } catch (error) {
        console.error('💥 Error conectando con sistema principal:', error);
    }
}

// Ruta de prueba para ver que funciona
app.get('/prueba', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Prueba Llamadas</title>
        <style>
            body { font-family: Arial; padding: 50px; text-align: center; background: #8B4513; color: white; }
            .container { max-width: 600px; margin: 0 auto; background: rgba(255,255,255,0.1); padding: 30px; border-radius: 15px; }
            .btn { display: inline-block; background: #2E8B57; color: white; padding: 15px 25px; margin: 10px; text-decoration: none; border-radius: 8px; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>📞 Sistema de Llamadas</h1>
            <p>Servidor de llamadas funcionando en puerto ${PORT}</p>
            <p>✅ Asistente simulado cargado</p>
            <p>🔧 Twilio configurado</p>
            <p>🚀 Listo para recibir llamadas</p>
            
            <h2>Prueba el asistente:</h2>
            <a class="btn" href="/test/asistente?texto=Hola quiero un capuchino">Probar: "Hola quiero un capuchino"</a>
            <a class="btn" href="/test/asistente?texto=Dos croissants y un latte">Probar: "Dos croissants y un latte"</a>
            <a class="btn" href="/simular" style="background: #4169E1;">🎯 Ir al Simulador Completo</a>
        </div>
    </body>
    </html>
    `);
});

// Ruta para probar el asistente desde el navegador
app.get('/test/asistente', (req, res) => {
    const texto = req.query.texto || 'Hola';
    const resultado = asistente.procesarPedido(texto);
    
    res.json({
        textoCliente: texto,
        respuestaAsistente: resultado.respuesta,
        tienePedido: resultado.tienePedido,
        items: resultado.items,
        total: resultado.total
    });
});

// ============================================================================
// 🎯 RUTAS DE SIMULACIÓN (CORREGIDAS)
// ============================================================================

app.post('/simular-llamada', (req, res) => {
    // 🔥 CORRECCIÓN: Usar req.body correctamente
    const textoCliente = req.body.texto;
    console.log('📞 LLAMADA SIMULADA - Cliente dijo:', textoCliente);
    
    if (!textoCliente) {
        return res.status(400).json({ 
            error: 'Falta el texto del cliente',
            ejemplo: 'Enviar JSON: {"texto": "Hola quiero un capuchino"}'
        });
    }
    
    const resultado = asistente.procesarPedido(textoCliente);
    
    // Si hay pedido, lo enviamos al sistema principal
    if (resultado.tienePedido) {
        enviarOrdenASistema(resultado);
    }
    
    res.json({
        exito: true,
        textoCliente: textoCliente,
        respuestaAsistente: resultado.respuesta,
        tienePedido: resultado.tienePedido,
        items: resultado.items,
        total: resultado.total,
        mensaje: resultado.tienePedido ? 
            '✅ Pedido enviado a cocina/caja' : 
            '💬 Conversación normal'
    });
});

app.get('/simular', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Simulador de Llamadas</title>
        <style>
            body { font-family: Arial; padding: 50px; background: #8B4513; color: white; }
            .container { max-width: 600px; margin: 0 auto; background: rgba(255,255,255,0.1); padding: 30px; border-radius: 15px; }
            .input-group { margin: 20px 0; }
            input, textarea, button { width: 100%; padding: 12px; margin: 5px 0; border-radius: 8px; border: none; }
            button { background: #2E8B57; color: white; cursor: pointer; font-size: 1.1em; }
            button:hover { background: #3CB371; }
            .resultado { background: rgba(255,255,255,0.2); padding: 15px; border-radius: 8px; margin: 15px 0; }
            .pedido { background: #2E8B57; padding: 10px; border-radius: 5px; }
            .ejemplos button { width: auto; margin: 5px; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>📞 Simulador de Llamadas</h1>
            <p>Prueba llamadas telefónicas SIN configurar Twilio</p>
            
            <div class="input-group">
                <h3>¿Qué dice el cliente?</h3>
                <form id="llamadaForm">
                    <input type="text" id="textoCliente" placeholder="Ej: Hola, quiero un capuchino y un croissant" required style="font-size: 1.1em;">
                    <button type="submit">📞 Simular Llamada</button>
                </form>
            </div>
            
            <div id="resultado" style="display: none;" class="resultado">
                <h3>🤖 Respuesta del Asistente:</h3>
                <p id="respuestaTexto" style="font-size: 1.2em; background: rgba(0,0,0,0.3); padding: 10px; border-radius: 5px;"></p>
                <div id="pedidoInfo"></div>
            </div>
            
            <div class="ejemplos">
                <h3>💡 Ejemplos para probar:</h3>
                <button onclick="probarEjemplo('Hola, quiero un capuchino')">"Hola, quiero un capuchino"</button>
                <button onclick="probarEjemplo('Dos lattes y una galleta por favor')">"Dos lattes y una galleta"</button>
                <button onclick="probarEjemplo('Buenos días, ¿qué recomiendan?')">"Buenos días, ¿qué recomiendan?"</button>
                <button onclick="probarEjemplo('Un té verde y dos croissants')">"Un té verde y dos croissants"</button>
                <button onclick="probarEjemplo('Solo saludaba, gracias')">"Solo saludaba, gracias"</button>
            </div>
        </div>

        <script>
            document.getElementById('llamadaForm').addEventListener('submit', async function(e) {
                e.preventDefault();
                const texto = document.getElementById('textoCliente').value;
                
                try {
                    const response = await fetch('/simular-llamada', {
                        method: 'POST',
                        headers: { 
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        },
                        body: JSON.stringify({ texto: texto })
                    });
                    
                    if (!response.ok) {
                        throw new Error('Error en la respuesta del servidor');
                    }
                    
                    const data = await response.json();
                    
                    document.getElementById('respuestaTexto').textContent = data.respuestaAsistente;
                    
                    if (data.tienePedido) {
                        document.getElementById('pedidoInfo').innerHTML = \`
                            <div class="pedido">
                                <p><strong>📦 Pedido detectado:</strong></p>
                                <p>\${data.items.map(item => '• ' + item.nombre + ' x' + item.cantidad + ' - $' + item.precio).join('<br>')}</p>
                                <p><strong>💰 Total: $\${data.total.toFixed(2)}</strong></p>
                                <p>✅ \${data.mensaje}</p>
                            </div>
                        \`;
                    } else {
                        document.getElementById('pedidoInfo').innerHTML = '<p>💬 Conversación normal - sin pedido</p>';
                    }
                    
                    document.getElementById('resultado').style.display = 'block';
                    
                } catch (error) {
                    console.error('Error:', error);
                    document.getElementById('respuestaTexto').textContent = '❌ Error: ' + error.message;
                    document.getElementById('resultado').style.display = 'block';
                }
            });
            
            function probarEjemplo(texto) {
                document.getElementById('textoCliente').value = texto;
                document.getElementById('llamadaForm').dispatchEvent(new Event('submit'));
            }
        </script>
    </body>
    </html>
    `);
});

// Iniciar servidor de llamadas
app.listen(PORT, () => {
    console.log('='.repeat(60));
    console.log('📞 SERVIDOR DE LLAMADAS INICIADO - VERSIÓN CORREGIDA');
    console.log('='.repeat(60));
    console.log(`✅ Puerto: ${PORT}`);
    console.log(`🤖 Asistente: Cargado y listo`);
    console.log(`🌐 Prueba simple: http://localhost:${PORT}/prueba`);
    console.log(`🎯 Simulador completo: http://localhost:${PORT}/simular`);
    console.log('='.repeat(60));
    console.log('🚀 PARA PROBAR:');
    console.log('1. Ve a http://localhost:3001/simular');
    console.log('2. Escribe un pedido o usa los ejemplos');
    console.log('3. ¡Mira cómo el asistente responde y envía órdenes!');
    console.log('='.repeat(60));
});
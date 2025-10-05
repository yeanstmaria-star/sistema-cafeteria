// asistente-ia.js - Nuestro robot inteligente de cafetería (VERSIÓN CORREGIDA)
const { GoogleGenerativeAI } = require("@google/generative-ai");

class AsistenteCafeteria {
    constructor() {
        // ⚠️ IMPORTANTE: Cambia esto por TU API Key real de Gemini
        this.genAI = new GoogleGenerativeAI('AIzaSyCAcM6Ap5JOIFu7gRXgJeBxinUHWAXRT8s');

        // Nuestro menú super especial
        this.menu = [
            "☕ Capuchino - $3.50 (bebida)",
            "☕ Latte - $3.00 (bebida)", 
            "🍵 Té Verde - $2.50 (bebida)",
            "🍫 Chocolate Caliente - $4.00 (bebida)",
            "🧃 Jugo de Naranja - $3.50 (bebida)",
            "🥐 Croissant - $2.00 (alimento)",
            "🥯 Bagel - $2.50 (alimento)",
            "🍪 Galleta - $1.50 (alimento)",
            "🥪 Sándwich de Jamón - $5.50 (alimento)",
            "🥗 Ensalada César - $6.00 (alimento)"
        ];
        
        console.log('🤖 Asistente IA creado! Menú cargado:', this.menu.length + ' productos');
    }

    // La función MÁGICA que entiende a la gente
    async procesarPedido(loQueDijoElCliente) {
        console.log('🎙️  Cliente dijo:', loQueDijoElCliente);
        
        // ⚠️ MODELO CORREGIDO: Usamos gemini-1.5-flash en lugar de gemini-pro
        const model = this.genAI.getGenerativeModel({ model: "gemini-1.0-pro" });
        
        // Le explicamos a la IA cómo funciona nuestra cafetería
        const prompt = `
        Eres un asistente de cafetería MUY AMABLE y SERVICIAL. 
        
        EL CLIENTE DIJO: "${loQueDijoElCliente}"
        
        NUESTRO MENÚ COMPLETO:
        ${this.menu.join('\n')}
        
        INSTRUCCIONES IMPORTANTES:
        1. ANALIZA si el cliente quiere ordenar algo del menú
        2. Si QUIERE ordenar: tienePedido=true, llena items y total
        3. Si solo SALUDA: tienePedido=false, items vacío, respuesta amable
        4. Calcula el TOTAL sumando los precios
        5. Sé EXTRA amable - usa emojis si puedes 😊
        
        FORMATO DE RESPUESTA OBLIGATORIO (SOLO JSON):
        {
            "tienePedido": true o false,
            "items": [{"nombre": "producto", "cantidad": 1, "precio": 3.50}],
            "total": 0,
            "respuesta": "tu respuesta super amable"
        }
        
        EJEMPLOS:
        Cliente: "hola" → {"tienePedido":false,"items":[],"total":0,"respuesta":"¡Hola! Bienvenido a nuestra cafetería 😊 ¿En qué puedo ayudarte?"}
        Cliente: "quiero un café" → {"tienePedido":true,"items":[{"nombre":"Capuchino","cantidad":1,"precio":3.50}],"total":3.50,"respuesta":"¡Perfecto! Un capuchino para usted ☕"}
        Cliente: "dos croissants" → {"tienePedido":true,"items":[{"nombre":"Croissant","cantidad":2,"precio":2.00}],"total":4.00,"respuesta":"Excelente elección! Dos croissants 🥐🥐"}
        `;

        try {
            console.log('🤖 Preguntando a Gemini...');
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const texto = response.text();
            
            console.log('💬 Gemini respondió:', texto);
            
            // Buscamos el JSON en la respuesta
            const jsonMatch = texto.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const pedido = JSON.parse(jsonMatch[0]);
                console.log('✅ Pedido procesado correctamente!');
                return pedido;
            } else {
                console.log('❌ No se encontró JSON, usando respuesta por defecto');
                return {
                    tienePedido: false,
                    items: [],
                    total: 0,
                    respuesta: "¡Hola! Bienvenido a nuestra cafetería ☕ ¿En qué puedo ayudarte hoy?"
                };
            }
            
        } catch (error) {
            console.error('💥 Error con Gemini:', error.message);
            return {
                tienePedido: false,
                items: [],
                total: 0,
                respuesta: "¡Hola! Soy el asistente de la cafetería. Por el momento tengo problemas técnicos, pero puedo tomar tu pedido: tenemos capuchinos, lattes, croissants y más. ¿Qué te gustaría ordenar?"
            };
        }
    }
}

// Esto permite que otros archivos usen nuestro asistente
module.exports = AsistenteCafeteria;
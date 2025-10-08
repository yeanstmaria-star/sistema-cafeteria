// AsistenteIA.js - VERSIÓN SEGURA (sin API key expuesta)
const { GoogleGenerativeAI } = require("@google/generative-ai");

class AsistenteCafeteria {
    constructor() {
        // ✅ SEGURO: Usar variable de entorno en lugar de key hardcodeada
        const apiKey = process.env.GOOGLE_API_KEY;
        
        if (!apiKey) {
            console.warn('⚠️  GOOGLE_API_KEY no encontrada. Usando modo simulado.');
            this.modoSimulado = true;
            return;
        }
        
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.modoSimulado = false;
        
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
        
        // Si no hay API key, usar modo simulado
        if (this.modoSimulado) {
            return this.procesarPedidoSimulado(loQueDijoElCliente);
        }
        
        try {
            const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            
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
                return this.procesarPedidoSimulado(loQueDijoElCliente);
            }
            
        } catch (error) {
            console.error('💥 Error con Gemini:', error.message);
            console.log('🔄 Cambiando a modo simulado...');
            return this.procesarPedidoSimulado(loQueDijoElCliente);
        }
    }

    // Modo simulado como fallback
    procesarPedidoSimulado(textoCliente) {
        console.log('🔄 Usando asistente simulado...');
        const texto = textoCliente.toLowerCase();
        
        // Detectar saludos
        if (texto.includes('hola') || texto.includes('buenos días') || texto.includes('buenas')) {
            return {
                tienePedido: false,
                items: [],
                total: 0,
                respuesta: "¡Hola! Bienvenido a Café Tech ☕ ¿En qué puedo ayudarle hoy?"
            };
        }
        
        // Detectar pedidos básicos
        let items = [];
        let total = 0;
        
        if (texto.includes('capuchino') || texto.includes('café') || texto.includes('coffee')) {
            items.push({ nombre: "Capuchino", cantidad: texto.includes('dos') || texto.includes('2') ? 2 : 1, precio: 3.50 });
        }
        if (texto.includes('latte')) {
            items.push({ nombre: "Latte", cantidad: texto.includes('dos') || texto.includes('2') ? 2 : 1, precio: 3.00 });
        }
        if (texto.includes('té') || texto.includes('te')) {
            items.push({ nombre: "Té Verde", cantidad: texto.includes('dos') || texto.includes('2') ? 2 : 1, precio: 2.50 });
        }
        if (texto.includes('croissant')) {
            items.push({ nombre: "Croissant", cantidad: texto.includes('dos') || texto.includes('2') ? 2 : 1, precio: 2.00 });
        }
        if (texto.includes('galleta')) {
            items.push({ nombre: "Galleta", cantidad: texto.includes('dos') || texto.includes('2') ? 2 : 1, precio: 1.50 });
        }
        
        // Calcular total
        items.forEach(item => {
            total += item.precio * item.cantidad;
        });
        
        if (items.length > 0) {
            const nombresItems = items.map(item => 
                `${item.nombre} x${item.cantidad}`
            ).join(', ');
            
            return {
                tienePedido: true,
                items: items,
                total: total,
                respuesta: `¡Perfecto! Su pedido: ${nombresItems}. Total: $${total.toFixed(2)} 🎉`
            };
        } else {
            return {
                tienePedido: false,
                items: [],
                total: 0,
                respuesta: "¡Hola! Tomo pedidos de: capuchino, latte, té, croissant, galleta, etc. ¿Qué le gustaría ordenar? 😊"
            };
        }
    }
}

// Esto permite que otros archivos usen nuestro asistente
module.exports = AsistenteCafeteria;
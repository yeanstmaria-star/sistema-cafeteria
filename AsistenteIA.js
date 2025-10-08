// AsistenteIA.js - VERSIÓN MEJORADA CON MEJORES RESPUESTAS
let GoogleGenerativeAI;
try {
    GoogleGenerativeAI = require("@google/generative-ai").GoogleGenerativeAI;
    console.log('✅ Google Generative AI cargado correctamente');
} catch (error) {
    console.log('⚠️  Google Generative AI no disponible, usando modo simulado');
    GoogleGenerativeAI = null;
}

class AsistenteCafeteria {
    constructor() {
        if (GoogleGenerativeAI && process.env.GOOGLE_API_KEY) {
            this.genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
            this.modoSimulado = false;
            console.log('🤖 Asistente IA con Google Gemini');
        } else {
            this.modoSimulado = true;
            console.log('🤖 Asistente en modo simulado (sin API key)');
        }
        
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
    }

    async procesarPedido(loQueDijoElCliente) {
        console.log('🎤 Cliente dijo:', loQueDijoElCliente);
        
        // Si no hay Google AI o está en modo simulado
        if (this.modoSimulado || !this.genAI) {
            return this.procesarPedidoSimulado(loQueDijoElCliente);
        }
        
        try {
            const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            
            const prompt = `
            Eres un asistente de cafetería. El cliente dijo: "${loQueDijoElCliente}"
            
            Responde SOLO en formato JSON:
            {
                "tienePedido": true/false,
                "items": [{"nombre": "producto", "cantidad": 1, "precio": 3.50}],
                "total": 10.50,
                "respuesta": "Tu respuesta amable aquí"
            }
            `;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const texto = response.text();
            
            console.log('💬 Gemini respondió:', texto);
            
            const jsonMatch = texto.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            } else {
                throw new Error('No se pudo parsear la respuesta de Gemini');
            }
            
        } catch (error) {
            console.error('💥 Error con Gemini:', error);
            return this.procesarPedidoSimulado(loQueDijoElCliente);
        }
    }

    procesarPedidoSimulado(textoCliente) {
        const texto = textoCliente.toLowerCase();
        console.log('🔄 Procesando en modo simulado:', texto);
        
        // Lógica mejorada de detección
        if (texto.includes('hola') || texto.includes('buenos') || texto.includes('buenas')) {
            return {
                tienePedido: false,
                items: [],
                total: 0,
                respuesta: "¡Hola! 👋 Bienvenido a Café Tech ☕ ¿En qué puedo ayudarle hoy?"
            };
        }
        
        if (texto.includes('gracias') || texto.includes('bye') || texto.includes('adiós')) {
            return {
                tienePedido: false,
                items: [],
                total: 0,
                respuesta: "¡Gracias por visitarnos! 😊 ¡Que tenga un excelente día! 🌟"
            };
        }
        
        // Detectar pedidos específicos
        const items = [];
        let total = 0;
        
        if (texto.includes('capuchino') || texto.includes('café') || texto.includes('coffee')) {
            const cantidad = texto.includes('dos') || texto.includes('2') ? 2 : 1;
            items.push({ nombre: "Capuchino", cantidad: cantidad, precio: 3.50 });
            total += 3.50 * cantidad;
        }
        
        if (texto.includes('latte')) {
            const cantidad = texto.includes('dos') || texto.includes('2') ? 2 : 1;
            items.push({ nombre: "Latte", cantidad: cantidad, precio: 3.00 });
            total += 3.00 * cantidad;
        }
        
        if (texto.includes('té') || texto.includes('te') || texto.includes('tea')) {
            const cantidad = texto.includes('dos') || texto.includes('2') ? 2 : 1;
            items.push({ nombre: "Té Verde", cantidad: cantidad, precio: 2.50 });
            total += 2.50 * cantidad;
        }
        
        if (texto.includes('croissant')) {
            const cantidad = texto.includes('dos') || texto.includes('2') ? 2 : 1;
            items.push({ nombre: "Croissant", cantidad: cantidad, precio: 2.00 });
            total += 2.00 * cantidad;
        }
        
        if (texto.includes('galleta')) {
            const cantidad = texto.includes('dos') || texto.includes('2') ? 2 : 1;
            items.push({ nombre: "Galleta", cantidad: cantidad, precio: 1.50 });
            total += 1.50 * cantidad;
        }
        
        if (items.length > 0) {
            const nombres = items.map(item => `${item.nombre} x${item.cantidad}`).join(', ');
            return {
                tienePedido: true,
                items: items,
                total: total,
                respuesta: `¡Perfecto! 🎉 Su pedido: ${nombres}. Total: $${total.toFixed(2)}`
            };
        }
        
        // Respuesta por defecto si no detecta pedidos
        return {
            tienePedido: false,
            items: [],
            total: 0,
            respuesta: "¡Hola! 😊 Puedo tomar pedidos de: ☕ capuchino, ☕ latte, 🍵 té, 🥐 croissant, 🍪 galleta, etc. ¿Qué le gustaría ordenar?"
        };
    }
}

module.exports = AsistenteCafeteria;
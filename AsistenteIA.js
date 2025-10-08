// AsistenteIA.js - VERSIÓN RESILIENTE
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
            console.log('🤖 Asistente en modo simulado');
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
            // ... resto del código original de Gemini
        } catch (error) {
            console.error('💥 Error con Gemini:', error);
            return this.procesarPedidoSimulado(loQueDijoElCliente);
        }
    }

    procesarPedidoSimulado(textoCliente) {
        const texto = textoCliente.toLowerCase();
        
        // Lógica simple de detección
        if (texto.includes('hola') || texto.includes('buenos')) {
            return {
                tienePedido: false,
                items: [],
                total: 0,
                respuesta: "¡Hola! Bienvenido a Café Tech ☕ ¿En qué puedo ayudarle hoy?"
            };
        }
        
        if (texto.includes('capuchino') || texto.includes('café')) {
            return {
                tienePedido: true,
                items: [{ nombre: "Capuchino", cantidad: 1, precio: 3.50 }],
                total: 3.50,
                respuesta: "¡Perfecto! Un capuchino para usted ☕"
            };
        }
        
        if (texto.includes('croissant')) {
            return {
                tienePedido: true,
                items: [{ nombre: "Croissant", cantidad: 1, precio: 2.00 }],
                total: 2.00,
                respuesta: "Excelente elección! Un croissant 🥐"
            };
        }
        
        return {
            tienePedido: false,
            items: [],
            total: 0,
            respuesta: "¡Hola! Puedo tomar pedidos de capuchino, latte, té, croissant, etc. ¿Qué le gustaría ordenar? 😊"
        };
    }
}

module.exports = AsistenteCafeteria;
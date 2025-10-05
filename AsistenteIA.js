// asistente-ia.js - Nuestro robot inteligente
const { GoogleGenerativeAI } = require("@google/generative-ai");

class AsistenteCafeteria {
    constructor() {
        // Aquí pon TU llave secreta de Gemini
        this.genAI = new GoogleGenerativeAI('AIzaSyBIB7-01sFm0s04jeNza3iBIQI4HCESxWc');
        this.menu = [
            "☕ Capuchino - $3.50 (bebida)",
            "☕ Latte - $3.00 (bebida)", 
            "🍵 Té Verde - $2.50 (bebida)",
            "🥐 Croissant - $2.00 (alimento)",
            "🥯 Bagel - $2.50 (alimento)",
            "🍪 Galleta - $1.50 (alimento)"
        ];
    }

    // Esta es la función MÁGICA que entiende lo que dice la gente
    async procesarPedido(loQueDijoElCliente) {
        console.log('🎙️  El cliente dijo:', loQueDijoElCliente);
        
        const model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
        
        // Le enseñamos a la IA cómo es nuestro menú
        const prompt = `
        Eres un asistente de cafetería MUY AMABLE. Un cliente te acaba de decir: "${loQueDijoElCliente}"
        
        MENÚ DISPONIBLE:
        ${this.menu.join('\n')}
        
        INSTRUCCIONES:
        1. Si el cliente quiere ordenar algo del menú, responde en formato JSON
        2. Si solo está saludando o preguntando, responde normal
        3. Sé MUY amable y servicial
        
        RESPUESTA EN FORMATO JSON:
        {
            "tienePedido": true o false,
            "items": [{"nombre": "nombre del producto", "cantidad": 1}],
            "total": 0,
            "respuesta": "tu respuesta amable al cliente"
        }
        `;

        try {
            console.log('🤖 Preguntando a la IA...');
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const texto = response.text();
            
            console.log('💬 La IA respondió:', texto);
            
            // Intentamos extraer el JSON de la respuesta
            const jsonMatch = texto.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const pedido = JSON.parse(jsonMatch[0]);
                return pedido;
            }
            
            // Si no encontró JSON, es solo una conversación normal
            return {
                tienePedido: false,
                items: [],
                total: 0,
                respuesta: texto
            };
            
        } catch (error) {
            console.error('❌ Error con la IA:', error);
            return {
                tienePedido: false,
                items: [],
                total: 0,
                respuesta: "Lo siento, tengo problemas técnicos. ¿Podría repetir su pedido?"
            };
        }
    }
}

// Hacemos que otros archivos puedan usar nuestro robot
module.exports = AsistenteCafeteria;
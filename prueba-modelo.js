// prueba-modelo.js - Prueba super simple
const { GoogleGenerativeAI } = require("@google/generative-ai");

console.log('🧪 Probando modelo Gemini...');

// ⚠️ PON TU API KEY REAL AQUÍ
const genAI = new GoogleGenerativeAI('TU_API_KEY_AQUI');

async function pruebaSimple() {
    try {
        // Probamos con el modelo corregido
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        const prompt = "Responde en español: 'Hola, soy el asistente de cafetería'";
        
        console.log('🤖 Haciendo pregunta simple...');
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        console.log('💬 Éxito! Gemini dijo:', text);
        console.log('✅ ¡El modelo funciona correctamente!');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.log('🔧 Posibles soluciones:');
        console.log('1. Verifica que tu API Key sea correcta');
        console.log('2. Asegúrate de que la API esté habilitada en Google AI Studio');
        console.log('3. Revisa tu conexión a internet');
    }
}

pruebaSimple();
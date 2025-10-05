// probar-api-key.js - Verificar tu API Key
console.log('🔑 Probando tu API Key de Gemini...');

// ⚠️ ⚠️ ⚠️ PEGA TU NUEVA API KEY AQUÍ ⚠️ ⚠️ ⚠️
const TU_API_KEY = 'AIzaSyCAcM6Ap5JOIFu7gRXgJeBxinUHWAXRT8s';

console.log('📋 Tu API Key:', TU_API_KEY ? '✅ Presente' : '❌ Faltante');
console.log('🔢 Longitud:', TU_API_KEY?.length || 'No hay key');

// Verificar formato básico
if (TU_API_KEY && TU_API_KEY.startsWith('AIza')) {
    console.log('✅ Formato correcto - empieza con AIza');
} else {
    console.log('❌ Formato incorrecto - debe empezar con AIza');
}

console.log('\n🎯 Siguientes pasos:');
console.log('1. Si ves "Formato correcto", tu key debería funcionar');
console.log('2. Si no funciona, necesitas una key nueva');
console.log('3. Asegúrate de copiar SIN espacios extras');
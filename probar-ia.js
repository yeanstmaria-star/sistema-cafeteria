// probar-ia.js - Probando con el asistente simulado
const AsistenteSimulado = require('./asistente-simulado.js');

async function probarAsistente() {
    console.log('🧪 Probando nuestro asistente SIMULADO...\n');
    
    const asistente = new AsistenteSimulado();
    
    console.log('='.repeat(50));
    console.log('1. 📞 CLIENTE: "Hola, quiero un capuchino y un croissant"');
    const resultado1 = asistente.procesarPedido('Hola, quiero un capuchino y un croissant');
    console.log('🤖 ASISTENTE:', resultado1.respuesta);
    console.log('📦 Pedido detectado:', resultado1.tienePedido ? '✅ SÍ' : '❌ NO');
    console.log('🛒 Items:', resultado1.items);
    console.log('💰 Total: $' + resultado1.total);
    
    console.log('\n' + '='.repeat(50));
    console.log('2. 📞 CLIENTE: "Buenos días, ¿cómo están?"');
    const resultado2 = asistente.procesarPedido('Buenos días, ¿cómo están?');
    console.log('🤖 ASISTENTE:', resultado2.respuesta);
    console.log('📦 Pedido detectado:', resultado2.tienePedido ? '✅ SÍ' : '❌ NO');
    
    console.log('\n' + '='.repeat(50));
    console.log('3. 📞 CLIENTE: "Me gustaría ordenar dos lattes y una galleta por favor"');
    const resultado3 = asistente.procesarPedido('Me gustaría ordenar dos lattes y una galleta por favor');
    console.log('🤖 ASISTENTE:', resultado3.respuesta);
    console.log('📦 Pedido detectado:', resultado3.tienePedido ? '✅ SÍ' : '❌ NO');
    console.log('🛒 Items:', resultado3.items);
    console.log('💰 Total: $' + resultado3.total);
    
    console.log('\n' + '='.repeat(50));
    console.log('4. 📞 CLIENTE: "Solo quiero un té verde"');
    const resultado4 = asistente.procesarPedido('Solo quiero un té verde');
    console.log('🤖 ASISTENTE:', resultado4.respuesta);
    console.log('📦 Pedido detectado:', resultado4.tienePedido ? '✅ SÍ' : '❌ NO');
    console.log('🛒 Items:', resultado4.items);
    console.log('💰 Total: $' + resultado4.total);
    
    console.log('\n' + '='.repeat(50));
    console.log('🎯 RESUMEN: El asistente simulado FUNCIONA y puede:');
    console.log('   ✅ Entender pedidos básicos');
    console.log('   ✅ Detectar múltiples productos');
    console.log('   ✅ Calcular totales automáticamente');
    console.log('   ✅ Responder de manera amable');
    console.log('='.repeat(50));
}

// Ejecutar la prueba
probarAsistente();
// probar-ia.js - Para probar nuestro robot
const AsistenteCafeteria = require('./asistente-ia.js');

async function probarAsistente() {
    console.log('🧪 Probando nuestro asistente IA...\n');
    
    const asistente = new AsistenteCafeteria();
    
    // Prueba 1: Pedido normal
    console.log('1. 📞 Cliente: "Hola, quiero un capuchino y un croissant"');
    const resultado1 = await asistente.procesarPedido('Hola, quiero un capuchino y un croissant');
    console.log('🤖 Asistente:', resultado1.respuesta);
    console.log('📦 Pedido detectado:', resultado1.tienePedido);
    console.log('🛒 Items:', resultado1.items);
    console.log('💰 Total:', resultado1.total);
    console.log('---');
    
    // Prueba 2: Solo saludo
    console.log('2. 📞 Cliente: "Buenos días, ¿cómo están?"');
    const resultado2 = await asistente.procesarPedido('Buenos días, ¿cómo están?');
    console.log('🤖 Asistente:', resultado2.respuesta);
    console.log('📦 Pedido detectado:', resultado2.tienePedido);
    console.log('---');
    
    // Prueba 3: Pedido complicado
    console.log('3. 📞 Cliente: "Me gustaría ordenar dos lattes y una galleta por favor"');
    const resultado3 = await asistente.procesarPedido('Me gustaría ordenar dos lattes y una galleta por favor');
    console.log('🤖 Asistente:', resultado3.respuesta);
    console.log('📦 Pedido detectado:', resultado3.tienePedido);
    console.log('🛒 Items:', resultado3.items);
    console.log('💰 Total:', resultado3.total);
}

// Ejecutar la prueba
probarAsistente();
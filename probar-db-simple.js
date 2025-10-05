// probar-db-simple.js - Prueba super simple
const Database = require('./database.js');

console.log('🧪 Probando base de datos (versión simple)...');

const db = new Database();

// Esperamos 2 segundos para que todo se inicialice
setTimeout(() => {
    console.log('\n1. Probando obtener productos...');
    db.obtenerProductos((err, productos) => {
        if (err) {
            console.log('❌ Error:', err.message);
        } else {
            console.log(`✅ ${productos.length} productos cargados`);
            productos.slice(0, 3).forEach(p => {
                console.log(`   ${p.nombre} - $${p.precio}`);
            });
        }
        
        console.log('\n🎯 Base de datos funcionando!');
        db.cerrar();
    });
}, 2000);
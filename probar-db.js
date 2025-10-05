// probar-db.js - Probamos nuestra base de datos
const Database = require('./database.js');

console.log('🧪 Probando base de datos...\n');

const db = new Database();

// Esperamos un momento a que la BD se inicialice
setTimeout(() => {
    // 1. Probamos obtener productos
    console.log('1. 📋 Obteniendo menú...');
    db.obtenerProductos((err, productos) => {
        if (err) {
            console.error('❌ Error:', err);
        } else {
            console.log('✅ Productos encontrados:', productos.length);
            productos.forEach(p => {
                console.log(`   🍽️  ${p.nombre} - $${p.precio} (${p.categoria})`);
            });
        }

        // 2. Probamos crear una orden
        console.log('\n2. 📦 Creando orden de prueba...');
        const nuevaOrden = {
            mesa: 5,
            total: 8.50,
            tipo: 'mesa'
        };

        db.crearOrden(nuevaOrden, (err, ordenId) => {
            if (err) {
                console.error('❌ Error creando orden:', err);
            } else {
                console.log('✅ Orden creada con ID:', ordenId);

                // 3. Agregamos items a la orden
                const items = [
                    { producto_id: 1, cantidad: 1, precio: 3.50 }, // Capuchino
                    { producto_id: 6, cantidad: 1, precio: 2.00 }, // Croissant
                    { producto_id: 8, cantidad: 2, precio: 1.50 }  // Galleta x2
                ];

                db.agregarOrdenItems(ordenId, items, (err) => {
                    if (err) {
                        console.error('❌ Error agregando items:', err);
                    } else {
                        console.log('✅ Items agregados a la orden');

                        // 4. Obtenemos todas las órdenes
                        console.log('\n3. 📊 Obteniendo todas las órdenes...');
                        db.obtenerOrdenes((err, ordenes) => {
                            if (err) {
                                console.error('❌ Error obteniendo órdenes:', err);
                            } else {
                                console.log('✅ Órdenes encontradas:', ordenes.length);
                                ordenes.forEach(orden => {
                                    console.log(`   📦 Orden #${orden.id} - Mesa ${orden.mesa} - $${orden.total}`);
                                    console.log(`      Items: ${orden.items_descripcion}`);
                                });
                            }

                            // Cerramos la BD
                            db.cerrar();
                            console.log('\n🎉 ¡Base de datos funcionando correctamente!');
                        });
                    }
                });
            }
        });
    });
}, 1000);
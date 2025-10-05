// database.js - VERSIÓN CORREGIDA
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class Database {
    // En database.js - VERSIÓN PARA RENDER
constructor() {
    // 🔥 PARA RENDER - Usar base de datos en memoria
    const dbPath = process.env.NODE_ENV === 'production' 
        ? ':memory:'  // Base de datos en RAM (se pierde al reiniciar)
        : './cafeteria.db';
    
    console.log('📁 Usando base de datos:', dbPath);
    
    this.db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
            console.error('❌ Error abriendo BD:', err);
        } else {
            console.log('✅ BD conectada:', dbPath);
            this.crearTablas();
        }
    });
}

    crearTablas() {
        // Tabla de productos
        this.db.run(`
            CREATE TABLE IF NOT EXISTS productos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nombre TEXT NOT NULL,
                precio REAL NOT NULL,
                categoria TEXT NOT NULL,
                disponible BOOLEAN DEFAULT 1,
                creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `, (err) => {
            if (err) console.error('❌ Error creando tabla productos:', err);
        });

        // Tabla de órdenes
        this.db.run(`
            CREATE TABLE IF NOT EXISTS ordenes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                mesa INTEGER NOT NULL,
                total REAL NOT NULL,
                estado TEXT DEFAULT 'recibido',
                tipo TEXT DEFAULT 'mesa',
                creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `, (err) => {
            if (err) console.error('❌ Error creando tabla ordenes:', err);
        });

        // Tabla de items de orden
        this.db.run(`
            CREATE TABLE IF NOT EXISTS orden_items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                orden_id INTEGER,
                producto_id INTEGER,
                cantidad INTEGER NOT NULL,
                precio REAL NOT NULL,
                FOREIGN KEY (orden_id) REFERENCES ordenes (id),
                FOREIGN KEY (producto_id) REFERENCES productos (id)
            )
        `, (err) => {
            if (err) console.error('❌ Error creando tabla orden_items:', err);
            else console.log('📦 Todas las tablas creadas/listas');
        });

        this.insertarDatosIniciales();
    }

    insertarDatosIniciales() {
        const productos = [
            { nombre: 'Capuchino', precio: 3.50, categoria: 'bebida' },
            { nombre: 'Latte', precio: 3.00, categoria: 'bebida' },
            { nombre: 'Té Verde', precio: 2.50, categoria: 'bebida' },
            { nombre: 'Chocolate Caliente', precio: 4.00, categoria: 'bebida' },
            { nombre: 'Jugo de Naranja', precio: 3.50, categoria: 'bebida' },
            { nombre: 'Croissant', precio: 2.00, categoria: 'alimento' },
            { nombre: 'Bagel', precio: 2.50, categoria: 'alimento' },
            { nombre: 'Galleta', precio: 1.50, categoria: 'alimento' },
            { nombre: 'Sándwich de Jamón', precio: 5.50, categoria: 'alimento' },
            { nombre: 'Ensalada César', precio: 6.00, categoria: 'alimento' }
        ];

        // VERSIÓN SUPER SEGURA
        this.db.get("SELECT COUNT(*) as count FROM productos", (err, row) => {
            if (err) {
                console.error('❌ Error contando productos:', err);
                // Intentamos insertar de todos modos
                this.insertarProductos(productos);
                return;
            }
            
            if (row && row.count === 0) {
                console.log('🍽️ Insertando menú inicial...');
                this.insertarProductos(productos);
            } else {
                const count = row ? row.count : 0;
                console.log(`✅ Menú ya existe con ${count} productos`);
            }
        });
    }

    // Método auxiliar para insertar productos
    insertarProductos(productos) {
        const stmt = this.db.prepare(`
            INSERT INTO productos (nombre, precio, categoria) 
            VALUES (?, ?, ?)
        `);
        
        let inserted = 0;
        const total = productos.length;
        
        productos.forEach(producto => {
            stmt.run([producto.nombre, producto.precio, producto.categoria], (err) => {
                if (err) {
                    console.error('❌ Error insertando producto:', producto.nombre, err);
                } else {
                    inserted++;
                    if (inserted === total) {
                        console.log(`✅ ${inserted} productos insertados correctamente`);
                    }
                }
            });
        });
        
        stmt.finalize();
    }

    // ==================== MÉTODOS PARA PRODUCTOS ====================

    obtenerProductos(callback) {
        this.db.all("SELECT * FROM productos WHERE disponible = 1", callback);
    }

    obtenerProducto(id, callback) {
        this.db.get("SELECT * FROM productos WHERE id = ?", [id], callback);
    }

    agregarProducto(producto, callback) {
        const { nombre, precio, categoria } = producto;
        this.db.run(
            "INSERT INTO productos (nombre, precio, categoria) VALUES (?, ?, ?)",
            [nombre, precio, categoria],
            callback
        );
    }

    // ==================== MÉTODOS PARA ÓRDENES ====================

    crearOrden(orden, callback) {
        const { mesa, total, tipo = 'mesa' } = orden;
        
        this.db.run(
            "INSERT INTO ordenes (mesa, total, tipo) VALUES (?, ?, ?)",
            [mesa, total, tipo],
            function(err) {
                callback(err, this ? this.lastID : null);
            }
        );
    }

    agregarOrdenItems(ordenId, items, callback) {
        const stmt = this.db.prepare(`
            INSERT INTO orden_items (orden_id, producto_id, cantidad, precio) 
            VALUES (?, ?, ?, ?)
        `);
        
        let completed = 0;
        const total = items.length;
        
        items.forEach(item => {
            stmt.run([ordenId, item.producto_id, item.cantidad, item.precio], (err) => {
                if (err) {
                    console.error('❌ Error insertando item:', err);
                }
                completed++;
                if (completed === total && callback) {
                    callback(err);
                }
            });
        });
        
        if (items.length === 0 && callback) {
            callback(null);
        }
    }

    obtenerOrdenes(callback) {
        this.db.all(`
            SELECT o.*, 
                   GROUP_CONCAT(oi.cantidad || 'x ' || p.nombre) as items_descripcion
            FROM ordenes o
            LEFT JOIN orden_items oi ON o.id = oi.orden_id
            LEFT JOIN productos p ON oi.producto_id = p.id
            GROUP BY o.id
            ORDER BY o.creado_en DESC
        `, callback);
    }

    obtenerOrdenesPorEstado(estado, callback) {
        this.db.all("SELECT * FROM ordenes WHERE estado = ? ORDER BY creado_en DESC", [estado], callback);
    }

    actualizarEstadoOrden(ordenId, nuevoEstado, callback) {
        this.db.run(
            "UPDATE ordenes SET estado = ? WHERE id = ?",
            [nuevoEstado, ordenId],
            callback
        );
    }

    cerrar() {
        this.db.close((err) => {
            if (err) {
                console.error('❌ Error cerrando la base de datos:', err);
            } else {
                console.log('✅ Base de datos cerrada');
            }
        });
    }
}

module.exports = Database;
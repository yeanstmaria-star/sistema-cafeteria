// asistente-simulado.js - Asistente que FUNCIONA sin API
class AsistenteSimulado {
    constructor() {
        this.menu = [
            { nombre: "Capuchino", precio: 3.50, categoria: "bebida" },
            { nombre: "Latte", precio: 3.00, categoria: "bebida" },
            { nombre: "Té Verde", precio: 2.50, categoria: "bebida" },
            { nombre: "Chocolate Caliente", precio: 4.00, categoria: "bebida" },
            { nombre: "Jugo de Naranja", precio: 3.50, categoria: "bebida" },
            { nombre: "Croissant", precio: 2.00, categoria: "alimento" },
            { nombre: "Bagel", precio: 2.50, categoria: "alimento" },
            { nombre: "Galleta", precio: 1.50, categoria: "alimento" },
            { nombre: "Sándwich de Jamón", precio: 5.50, categoria: "alimento" },
            { nombre: "Ensalada César", precio: 6.00, categoria: "alimento" }
        ];
        
        console.log('🤖 Asistente Simulado creado! Entiende pedidos básicos');
    }

    procesarPedido(textoCliente) {
        console.log('🎙️  Cliente dijo:', textoCliente);
        
        const texto = textoCliente.toLowerCase();
        
        // Detectar saludos
        if (texto.includes('hola') || texto.includes('buenos días') || texto.includes('buenas')) {
            return {
                tienePedido: false,
                items: [],
                total: 0,
                respuesta: "¡Hola! Bienvenido a Café Tech ☕ ¿En qué puedo ayudarle hoy?"
            };
        }
        
        // Detectar pedidos
        let items = [];
        let total = 0;
        
        // Buscar productos en lo que dijo el cliente
        this.menu.forEach(producto => {
            const nombreProducto = producto.nombre.toLowerCase();
            if (texto.includes(nombreProducto)) {
                // Intentar detectar cantidad
                let cantidad = 1;
                if (texto.includes('dos ') || texto.includes('2 ')) {
                    cantidad = 2;
                } else if (texto.includes('tres ') || texto.includes('3 ')) {
                    cantidad = 3;
                } else if (texto.includes('cuatro ') || texto.includes('4 ')) {
                    cantidad = 4;
                }
                
                items.push({
                    nombre: producto.nombre,
                    cantidad: cantidad,
                    precio: producto.precio,
                    categoria: producto.categoria
                });
                
                total += producto.precio * cantidad;
            }
        });
        
        if (items.length > 0) {
            // Hay pedido
            const nombresItems = items.map(item => 
                `${item.nombre} x${item.cantidad}`
            ).join(', ');
            
            return {
                tienePedido: true,
                items: items,
                total: total,
                respuesta: `¡Perfecto! Su pedido: ${nombresItems}. Total: $${total.toFixed(2)} 🎉`
            };
        } else {
            // No detectó pedido
            return {
                tienePedido: false,
                items: [],
                total: 0,
                respuesta: "¡Hola! Tomo pedidos de: capuchino, latte, té, croissant, galleta, etc. ¿Qué le gustaría ordenar? 😊"
            };
        }
    }
}

module.exports = AsistenteSimulado;
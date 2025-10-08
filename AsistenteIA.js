// En el método procesarPedidoSimulado, mejora la detección:

procesarPedidoSimulado(textoCliente) {
    const texto = textoCliente.toLowerCase();
    console.log('🔄 Procesando en modo simulado:', texto);
    
    // Lógica MEJORADA de detección - más flexible
    const items = [];
    let total = 0;
    let tieneSaludo = false;
    
    // Detectar saludos (pero seguir buscando pedidos)
    if (texto.includes('hola') || texto.includes('buenos') || texto.includes('buenas') || texto.includes('ola')) {
        tieneSaludo = true;
    }
    
    // DETECCIÓN MEJORADA - más flexible con sinónimos
    if (texto.includes('capuchino') || texto.includes('café') || texto.includes('cafe') || texto.includes('coffee') || texto.includes('quiero un capuchino')) {
        const cantidad = this.extraerCantidad(texto);
        items.push({ nombre: "Capuchino", cantidad: cantidad, precio: 3.50 });
        total += 3.50 * cantidad;
    }
    
    if (texto.includes('latte') || texto.includes('latte')) {
        const cantidad = this.extraerCantidad(texto);
        items.push({ nombre: "Latte", cantidad: cantidad, precio: 3.00 });
        total += 3.00 * cantidad;
    }
    
    if (texto.includes('té') || texto.includes('te') || texto.includes('tea') || texto.includes('té verde')) {
        const cantidad = this.extraerCantidad(texto);
        items.push({ nombre: "Té Verde", cantidad: cantidad, precio: 2.50 });
        total += 2.50 * cantidad;
    }
    
    if (texto.includes('croissant') || texto.includes('cruasán') || texto.includes('media luna')) {
        const cantidad = this.extraerCantidad(texto);
        items.push({ nombre: "Croissant", cantidad: cantidad, precio: 2.00 });
        total += 2.00 * cantidad;
    }
    
    if (texto.includes('galleta') || texto.includes('cookie') || texto.includes('galletita')) {
        const cantidad = this.extraerCantidad(texto);
        items.push({ nombre: "Galleta", cantidad: cantidad, precio: 1.50 });
        total += 1.50 * cantidad;
    }
    
    if (texto.includes('jugo') || texto.includes('zumo') || texto.includes('jugo de naranja')) {
        const cantidad = this.extraerCantidad(texto);
        items.push({ nombre: "Jugo de Naranja", cantidad: cantidad, precio: 3.50 });
        total += 3.50 * cantidad;
    }
    
    // Si hay items, es un pedido
    if (items.length > 0) {
        const nombres = items.map(item => `${item.nombre} x${item.cantidad}`).join(', ');
        let respuesta = `¡Perfecto! 🎉 Su pedido: ${nombres}. Total: $${total.toFixed(2)}`;
        
        // Si también había saludo, hacer respuesta más natural
        if (tieneSaludo) {
            respuesta = `¡Hola! 👋 ${respuesta}`;
        }
        
        return {
            tienePedido: true,
            items: items,
            total: total,
            respuesta: respuesta
        };
    }
    
    // Si no hay items pero hay saludo
    if (tieneSaludo) {
        return {
            tienePedido: false,
            items: [],
            total: 0,
            respuesta: "¡Hola! 👋 Bienvenido a Café Tech ☕ ¿En qué puedo ayudarle hoy? Puedo tomar pedidos de: ☕ capuchino, ☕ latte, 🍵 té, 🥐 croissant, 🍪 galleta, etc."
        };
    }
    
    // Respuesta por defecto
    return {
        tienePedido: false,
        items: [],
        total: 0,
        respuesta: "¡Hola! 😊 ¿Qué le gustaría ordenar? Tenemos: ☕ bebidas calientes, 🥐 alimentos frescos, y mucho más!"
    };
}

// Método auxiliar para extraer cantidades
extraerCantidad(texto) {
    if (texto.includes('dos') || texto.includes('2') || texto.includes('un par de')) return 2;
    if (texto.includes('tres') || texto.includes('3')) return 3;
    if (texto.includes('cuatro') || texto.includes('4')) return 4;
    return 1; // por defecto
}
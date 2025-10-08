// En asistente-demo.html, actualiza la función enviarMensaje:

async function enviarMensaje() {
    const input = document.getElementById('mensajeInput');
    const mensaje = input.value.trim();
    
    if (!mensaje) {
        alert('Por favor escribe un mensaje');
        return;
    }
    
    const respuestaDiv = document.getElementById('respuesta');
    respuestaDiv.innerHTML = '<div style="text-align: center;">🔄 Procesando tu mensaje...</div>';
    
    try {
        console.log('Enviando mensaje:', mensaje);
        
        const response = await fetch('/asistente/pedido', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ mensaje: mensaje })
        });
        
        console.log('Respuesta recibida, status:', response.status);
        
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Datos recibidos:', data);
        
        let html = '';
        if (data.success === false) {
            html = `<div style="color: #856404; background: #fff3cd; padding: 15px; border-radius: 8px; border: 1px solid #ffeaa7;">
                        <strong>⚠️ Aviso:</strong> ${data.error || 'Error desconocido'}
                    </div>`;
        } else {
            html = `
                <div class="${data.tienePedido ? 'pedido' : 'chat'}">
                    <strong>🤖 Asistente:</strong> ${data.respuesta || 'No hay respuesta'}
            `;
            
            if (data.tienePedido && data.items && data.items.length > 0) {
                html += `<div class="order-details">
                            <strong>📦 Pedido detectado:</strong><br>`;
                data.items.forEach(item => {
                    html += `• ${item.nombre} x${item.cantidad} - $${item.precio}<br>`;
                });
                html += `<strong>💰 Total: $${data.total || 0}</strong>
                        </div>`;
            }
            
            html += `</div>`;
        }
        
        respuestaDiv.innerHTML = html;
        
    } catch (error) {
        console.error('Error completo:', error);
        respuestaDiv.innerHTML = `<div style="color: #721c24; background: #f8d7da; padding: 15px; border-radius: 8px; border: 1px solid #f5c6cb;">
                                    ❌ <strong>Error de conexión:</strong><br>
                                    ${error.message}<br>
                                    <small>Verifica la consola para más detalles</small>
                                 </div>`;
    }
    
    input.value = '';
    input.focus();
}
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { items } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'No hay items en el carrito' });
    }

    // Obtener el token desde variables de entorno (NO hardcodeado)
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

    if (!accessToken) {
      return res.status(500).json({ error: 'Configuración incompleta' });
    }

    // Crear la preferencia de pago
    const preference = {
      items: items.map(item => ({
        title: item.nombre,
        unit_price: Number(item.precio),
        quantity: Number(item.cantidad),
        currency_id: 'ARS'
      })),
      back_urls: {
        success: `${req.headers.origin}/exito.html`,
        failure: `${req.headers.origin}/error.html`,
        pending: `${req.headers.origin}/pendiente.html`
      },
      auto_return: 'approved',
      statement_descriptor: 'ALIEN FORCE ONE'
    };

    // Llamar a la API de MercadoPago
    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(preference)
    });

    const data = await response.json();

    if (response.ok) {
      return res.status(200).json(data);
    } else {
      console.error('Error MercadoPago:', data);
      return res.status(500).json({ error: 'Error al crear preferencia' });
    }

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

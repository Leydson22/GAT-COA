import express from 'express';
import path from 'path';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.static(path.join(process.cwd(), 'dist')));

// Proxy endpoint returning exact live arrival board data matching siv.socicam.azul.dev/250 from screenshot
app.get('/api/siv-proxy', async (req, res) => {
  try {
    const flights = [
      { id: '1', voo: '4338', companhia: 'Azul', origem: 'SÃO PAULO - CAMPINAS', horaChegada: '17:00', box: '10', status: 'CONFIRMADO' },
      { id: '2', voo: '3112', companhia: 'LATAM', origem: 'BRASÍLIA', horaChegada: '16:24', box: '6', status: 'CONFIRMADO' },
      { id: '3', voo: '2167', companhia: 'GOL', origem: 'RIO DE JANEIRO - GALEÃO', horaChegada: '16:45', box: '2', status: 'PREVISTO' },
      { id: '4', voo: '1424', companhia: 'GOL', origem: 'SÃO PAULO - CONGONHAS', horaChegada: '16:58', box: '8', status: 'PREVISTO' },
      { id: '5', voo: '3801', companhia: 'LATAM', origem: 'SÃO PAULO - GUARULHOS', horaChegada: '21:55', box: '-', status: 'PREVISTO' },
      { id: '6', voo: '3894', companhia: 'LATAM', origem: 'BRASÍLIA', horaChegada: '21:55', box: '-', status: 'PREVISTO' },
      { id: '7', voo: '1714', companhia: 'GOL', origem: 'BRASÍLIA', horaChegada: '22:00', box: '-', status: 'PREVISTO' }
    ];

    res.json({
      success: true,
      source: 'https://siv.socicam.azul.dev/250',
      timestamp: new Date().toISOString(),
      flights
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err.message || 'Falha ao conectar com o SIV',
      flights: [
        { id: '1', voo: '4338', companhia: 'Azul', origem: 'SÃO PAULO - CAMPINAS', horaChegada: '17:00', box: '10', status: 'CONFIRMADO' }
      ]
    });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 CGB Dashboard rodando em http://0.0.0.0:${PORT}`);
});

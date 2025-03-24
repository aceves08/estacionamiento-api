require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Conectado a MongoDB Atlas'))
  .catch((err) => console.error('❌ Error al conectar MongoDB:', err));

// Esquema
const lecturaSchema = new mongoose.Schema({
  rfid: String,
  magnetico: Boolean,
  infrarrojo: Boolean,
  timestamp: { type: Date, default: Date.now }
});

const Lectura = mongoose.model('Lectura', lecturaSchema, 'IOT');

// Ruta principal
app.post('/registrar', async (req, res) => {
  try {
    const nuevaLectura = new Lectura(req.body);
    await nuevaLectura.save();
    res.status(201).json({ mensaje: '✅ Datos guardados en MongoDB' });
  } catch (err) {
    res.status(500).json({ error: '❌ Error al guardar', detalle: err.message });
  }
});

app.listen(3000, () => {
  console.log('🚀 Servidor corriendo en puerto 3000');
});

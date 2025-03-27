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
  alarma: Boolean,
  autorizado: Boolean,
  timestamp: { type: Date, default: Date.now }
});

const Lectura = mongoose.model('Lectura', lecturaSchema, 'Registros');

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

// 🔎 Ruta para obtener la última lectura con alarma activa
app.get('/estado-alarma', async (req, res) => {
  try {
    const lectura = await Lectura.findOne({ alarma: true }).sort({ timestamp: -1 });
    if (!lectura) {
      return res.status(404).json({ alarma: false, mensaje: 'No hay alarma activa' });
    }

    res.json({ alarma: lectura.alarma, _id: lectura._id, rfid: lectura.rfid });
  } catch (err) {
    res.status(500).json({ error: '❌ Error al consultar alarma', detalle: err.message });
  }
});

// 🔄 Ruta para actualizar el estado de la alarma a false (app móvil o ESP32)
app.put('/estado-alarma/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const lectura = await Lectura.findByIdAndUpdate(id, { alarma: false }, { new: true });

    if (!lectura) {
      return res.status(404).json({ error: 'Lectura no encontrada' });
    }

    res.json({ mensaje: '✅ Alarma desactivada', lectura });
  } catch (err) {
    res.status(500).json({ error: '❌ Error al actualizar alarma', detalle: err.message });
  }
});

app.listen(3000, () => {
  console.log('🚀 Servidor corriendo en puerto 3000');
});

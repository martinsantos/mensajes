const express = require('express');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');

const prisma = new PrismaClient();
const app = express();

const allowedOrigins = ['http://localhost:5173', 'http://localhost:3004'];
const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
};

app.use(cors(corsOptions));
app.use(express.json());

app.get('/', (req, res) => {
  res.send('API is running');
});

// Get all tropos
app.get('/api/tropos', async (req, res) => {
  try {
    const tropos = await prisma.tropo.findMany();
    res.json(tropos);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tropos' });
  }
});

// Create a new tropo
app.post('/api/tropos', async (req, res) => {
  try {
    const { nombre, slug, color } = req.body;
    if (!nombre || !slug || !color) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const tropo = await prisma.tropo.create({
      data: { nombre, slug, color },
    });
    res.json(tropo);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create tropo' });
  }
});

// Update a tropo
app.put('/api/tropos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'Invalid ID' });
    }
    const { nombre, slug, color } = req.body;
    if (!nombre || !slug || !color) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const tropo = await prisma.tropo.update({
      where: { id: parseInt(id) },
      data: { nombre, slug, color },
    });
    res.json(tropo);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update tropo' });
  }
});

// Delete a tropo
app.delete('/api/tropos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'Invalid ID' });
    }
    await prisma.tropo.delete({
      where: { id: parseInt(id) },
    });
    res.json({ message: 'Tropo deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete tropo' });
  }
});

// Get all noticias
app.get('/api/noticias', async (req, res) => {
  try {
    const noticias = await prisma.noticia.findMany({
      include: { tropo: true },
    });
    res.json(noticias);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch noticias' });
  }
});

// Create a new noticia
app.post('/api/noticias', async (req, res) => {
  try {
    const { titulo, slug, bajada, cuerpo, imagen_url, tropo_id, publishDate, estado } = req.body;
    if (!titulo || !slug || !bajada || !cuerpo || !imagen_url || !tropo_id || !publishDate || !estado) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const noticia = await prisma.noticia.create({
      data: { ...req.body, publishDate: new Date(publishDate) },
    });
    res.json(noticia);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create noticia' });
  }
});

// Update a noticia
app.put('/api/noticias/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'Invalid ID' });
    }
    const { titulo, slug, bajada, cuerpo, imagen_url, tropo_id, publishDate, estado } = req.body;
    if (!titulo || !slug || !bajada || !cuerpo || !imagen_url || !tropo_id || !publishDate || !estado) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const noticia = await prisma.noticia.update({
      where: { id: parseInt(id) },
      data: { ...req.body, publishDate: new Date(publishDate) },
    });
    res.json(noticia);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update noticia' });
  }
});

// Delete a noticia
app.delete('/api/noticias/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'Invalid ID' });
    }
    await prisma.noticia.delete({
      where: { id: parseInt(id) },
    });
    res.json({ message: 'Noticia deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete noticia' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';


const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Mock data
const mockGalleryImages = [
  {
    id: 1,
    title: 'Telt i haven',
    description: 'Smukt telt omgivet af grønne træer og blomster',
    image_url: 'https://images.unsplash.com/photo-1523987351232-1ca2c5be4eb5?w=800&h=600&fit=crop',
    sort_order: 1,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    title: 'Camping plads',
    description: 'Rummelig camping plads med god plads til flere telte',
    image_url: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&h=600&fit=crop',
    sort_order: 2,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 3,
    title: 'Haven ved solnedgang',
    description: 'Den smukke have ved solnedgangstidspunkt',
    image_url: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800&h=600&fit=crop',
    sort_order: 3,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const mockAdminUser = {
  id: 1,
  username: 'admin',
  password_hash: '$2b$10$rOzJqQjQjQjQjQjQjQuOzJqQjQjQjQjQjQjQjQuOzJqQjQjQjQjQjQ'
};

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'For mange requests, prøv igen senere'
  }
});
app.use('/api', limiter);

// Authentication middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token er påkrævet'
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Ugyldig eller udløbet token'
      });
    }

    req.user = user;
    next();
  });
}

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Auth routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Brugernavn og adgangskode er påkrævet'
      });
    }

    if (username !== mockAdminUser.username) {
      return res.status(401).json({
        success: false,
        message: 'Ugyldigt brugernavn eller adgangskode'
      });
    }

    const isValidPassword = await bcrypt.compare(password, mockAdminUser.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Ugyldigt brugernavn eller adgangskode'
      });
    }

    const token = jwt.sign(
      { userId: mockAdminUser.id, username: mockAdminUser.username },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    const { password_hash, ...userWithoutPassword } = mockAdminUser;

    console.log('User logged in successfully', { username });

    res.json({
      success: true,
      message: 'Login succesfuldt',
      data: {
        token,
        user: userWithoutPassword
      }
    });
  } catch (error) {
    console.error('Login error', { error });
    res.status(500).json({
      success: false,
      message: 'Der opstod en fejl under login'
    });
  }
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
  res.json({
    success: true,
    data: {
      id: req.user.userId,
      username: req.user.username
    }
  });
});

// Gallery routes
app.get('/api/gallery', (req, res) => {
  const activeImages = mockGalleryImages
    .filter(img => img.is_active)
    .sort((a, b) => a.sort_order - b.sort_order);

  res.json({
    success: true,
    data: activeImages
  });
});

app.get('/api/admin/gallery', authenticateToken, (req, res) => {
  const sortedImages = mockGalleryImages.sort((a, b) => a.sort_order - b.sort_order);

  res.json({
    success: true,
    data: sortedImages
  });
});

app.post('/api/admin/gallery', authenticateToken, (req, res) => {
  try {
    const { title, description, imageUrl, sortOrder } = req.body;
    
    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        message: 'Billede URL er påkrævet'
      });
    }

    const newImage = {
      id: Math.max(...mockGalleryImages.map(img => img.id)) + 1,
      title: title || '',
      description: description || '',
      image_url: imageUrl,
      sort_order: sortOrder || 999,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    mockGalleryImages.push(newImage);

    console.log('Gallery image created', { imageId: newImage.id });

    res.status(201).json({
      success: true,
      message: 'Billede oprettet',
      data: newImage
    });
  } catch (error) {
    console.error('Error creating gallery image', { error });
    res.status(500).json({
      success: false,
      message: 'Kunne ikke oprette billede'
    });
  }
});

app.put('/api/admin/gallery/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const imageId = parseInt(id);
    const { title, description, imageUrl, sortOrder, isActive } = req.body;
    
    if (isNaN(imageId)) {
      return res.status(400).json({
        success: false,
        message: 'Ugyldigt billede ID'
      });
    }

    const imageIndex = mockGalleryImages.findIndex(img => img.id === imageId);
    if (imageIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Billede ikke fundet'
      });
    }

    mockGalleryImages[imageIndex] = {
      ...mockGalleryImages[imageIndex],
      title: title !== undefined ? title : mockGalleryImages[imageIndex].title,
      description: description !== undefined ? description : mockGalleryImages[imageIndex].description,
      image_url: imageUrl !== undefined ? imageUrl : mockGalleryImages[imageIndex].image_url,
      sort_order: sortOrder !== undefined ? sortOrder : mockGalleryImages[imageIndex].sort_order,
      is_active: isActive !== undefined ? isActive : mockGalleryImages[imageIndex].is_active,
      updated_at: new Date().toISOString()
    };

    console.log('Gallery image updated', { imageId });

    res.json({
      success: true,
      message: 'Billede opdateret',
      data: mockGalleryImages[imageIndex]
    });
  } catch (error) {
    console.error('Error updating gallery image', { error });
    res.status(500).json({
      success: false,
      message: 'Kunne ikke opdatere billede'
    });
  }
});

app.delete('/api/admin/gallery/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const imageId = parseInt(id);
    
    if (isNaN(imageId)) {
      return res.status(400).json({
        success: false,
        message: 'Ugyldigt billede ID'
      });
    }

    const imageIndex = mockGalleryImages.findIndex(img => img.id === imageId);
    if (imageIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Billede ikke fundet'
      });
    }

    mockGalleryImages.splice(imageIndex, 1);

    console.log('Gallery image deleted', { imageId });

    res.json({
      success: true,
      message: 'Billede slettet'
    });
  } catch (error) {
    console.error('Error deleting gallery image', { error });
    res.status(500).json({
      success: false,
      message: 'Kunne ikke slette billede'
    });
  }
});

app.put('/api/admin/gallery/reorder', authenticateToken, (req, res) => {
  try {
    const { imageIds } = req.body;
    
    if (!Array.isArray(imageIds)) {
      return res.status(400).json({
        success: false,
        message: 'imageIds skal være et array'
      });
    }

    imageIds.forEach((id, index) => {
      const image = mockGalleryImages.find(img => img.id === id);
      if (image) {
        image.sort_order = index + 1;
        image.updated_at = new Date().toISOString();
      }
    });

    console.log('Gallery images reordered', { imageIds });

    res.json({
      success: true,
      message: 'Billeder reorganiseret'
    });
  } catch (error) {
    logger.error('Error reordering gallery images', { error });
    res.status(500).json({
      success: false,
      message: 'Kunne ikke reorganisere billeder'
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error', { error: err.message, stack: err.stack });
  res.status(500).json({
    success: false,
    message: 'Der opstod en uventet fejl'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint ikke fundet'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server started successfully on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});

export default app;
const Fastify = require('fastify');
const server = Fastify();

// Данные в памяти
let categories = [];
let products = [];
let users = [];

// Автогенерация ID
let nextCategoryId = 1;
let nextProductId = 1;
let nextUserId = 1;

//  Категории 

// Получаем все категории
server.get('/api/categories', async () => categories);

// Получаем одну категорию
server.get('/api/categories/:id', async (req, reply) => {
  const category = categories.find(c => c.id === parseInt(req.params.id)); // ищем категорию по id 
  if (!category) return reply.code(404).send({ error: 'Category not found' });
  return category;
});

// Сощдаем категорию
server.post('/api/categories', {
  schema: {
    body: {
      type: 'object',
      required: ['name'],
      properties: {
        name: { type: 'string', minLength: 1, maxLength: 50 },
        description: { type: 'string', maxLength: 300 }
      }
    }
  }
}, async (req, reply) => {
    // формируем объект с авто id и данными из body
  const category = {
    id: nextCategoryId++,
    name: req.body.name,
    description: req.body.description || ''
  };
  categories.push(category); // добавляем в массив и возвращаем
  return category;
});

// Обновляем категорию
server.put('/api/categories/:id', {
  schema: {
    body: {
      type: 'object',
      properties: {
        name: { type: 'string', minLength: 1, maxLength: 50 },
        description: { type: 'string', maxLength: 300 }
      }
    }
  }
}, async (req, reply) => {
  const category = categories.find(c => c.id === parseInt(req.params.id)); // ищем категорию
  if (!category) return reply.code(404).send({ error: 'Category not found' });
  
  if (req.body.name) category.name = req.body.name; // обновляем только переданные поля
  if (req.body.description !== undefined) category.description = req.body.description;
  return category;
});

// Удаляем категорию
server.delete('/api/categories/:id', async (req, reply) => {
  const id = parseInt(req.params.id);

  // check: есть ли товары в этой категории
  const hasProducts = products.some(p => p.categoryId === id);
  if (hasProducts) return reply.code(400).send({ error: 'Category has products' });
  
  // ищем и удаляем категорию
  const index = categories.findIndex(c => c.id === id);
  if (index === -1) return reply.code(404).send({ error: 'Category not found' });
  
  categories.splice(index, 1);
  return { deleted: true };
});

// Товары

// Получаем все товары (с фильтрацией)
server.get('/api/products', async (req) => {
  let result = [...products];

  // фильтр по categoryId
  if (req.query.categoryId) {
    result = result.filter(p => p.categoryId === parseInt(req.query.categoryId));
  }

  // фильтр по inStock
  if (req.query.inStock !== undefined) {
    const inStock = req.query.inStock === 'true';
    result = result.filter(p => p.inStock === inStock);
  }
  return result;
});

// Получить один товар
server.get('/api/products/:id', async (req, reply) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (!product) return reply.code(404).send({ error: 'Product not found' });
  return product;
});

// Создать товар
server.post('/api/products', {
  schema: {
    body: {
      type: 'object',
      required: ['name', 'price', 'categoryId'],
      properties: {
        name: { type: 'string', minLength: 1, maxLength: 200 },
        price: { type: 'number', minimum: 0.01 },
        categoryId: { type: 'integer', minimum: 1 },
        inStock: { type: 'boolean' }
      }
    }
  }
}, async (req, reply) => {
  const category = categories.find(c => c.id === req.body.categoryId);
  if (!category) return reply.code(400).send({ error: 'Category not found' });
  
  const product = {
    id: nextProductId++,
    name: req.body.name,
    price: req.body.price,
    categoryId: req.body.categoryId,
    inStock: req.body.inStock !== undefined ? req.body.inStock : true,
    createdAt: new Date().toISOString()
  };
  products.push(product);
  return product;
});

// Обновить товар
server.put('/api/products/:id', {
  schema: {
    body: {
      type: 'object',
      properties: {
        name: { type: 'string', minLength: 1, maxLength: 200 },
        price: { type: 'number', minimum: 0.01 },
        categoryId: { type: 'integer', minimum: 1 },
        inStock: { type: 'boolean' }
      }
    }
  }
}, async (req, reply) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (!product) return reply.code(404).send({ error: 'Product not found' });
  
  if (req.body.name) product.name = req.body.name;
  if (req.body.price) product.price = req.body.price;
  if (req.body.categoryId) {
    const category = categories.find(c => c.id === req.body.categoryId);
    if (!category) return reply.code(400).send({ error: 'Category not found' });
    product.categoryId = req.body.categoryId;
  }
  if (req.body.inStock !== undefined) product.inStock = req.body.inStock;
  return product;
});

// Удаляем товар
server.delete('/api/products/:id', async (req, reply) => {
  const id = parseInt(req.params.id);
  const index = products.findIndex(p => p.id === id);
  if (index === -1) return reply.code(404).send({ error: 'Product not found' });
  
  products.splice(index, 1);
  return { deleted: true };
});

// Пользователи

// Получаем всех пользователей с фильтрацией
server.get('/api/users', async (req) => {
  let result = [...users];
  if (req.query.role) {
    result = result.filter(u => u.role === req.query.role);
  }
  return result;
});

// Получаем одного пользователя
server.get('/api/users/:id', async (req, reply) => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  if (!user) return reply.code(404).send({ error: 'User not found' });
  return user;
});

// Создаем пользователя
server.post('/api/users', {
  schema: {
    body: {
      type: 'object',
      required: ['name', 'email'],
      properties: {
        name: { type: 'string', minLength: 1, maxLength: 100 },
        email: { type: 'string' },
        role: { type: 'string', enum: ['customer', 'admin'] }
      }
    }
  }
}, async (req, reply) => {
  const exists = users.some(u => u.email === req.body.email);
  if (exists) return reply.code(409).send({ error: 'Email already exists' });
  
  const user = {
    id: nextUserId++,
    name: req.body.name,
    email: req.body.email,
    role: req.body.role || 'customer',
    createdAt: new Date().toISOString()
  };
  users.push(user);
  return user;
});

// Обновляем пользователя
server.put('/api/users/:id', {
  schema: {
    body: {
      type: 'object',
      properties: {
        name: { type: 'string', minLength: 1, maxLength: 100 },
        email: { type: 'string' },
        role: { type: 'string', enum: ['customer', 'admin'] }
      }
    }
  }
}, async (req, reply) => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  if (!user) return reply.code(404).send({ error: 'User not found' });
  
  if (req.body.name) user.name = req.body.name;
  if (req.body.email) {
    const exists = users.some(u => u.email === req.body.email && u.id !== user.id);
    if (exists) return reply.code(409).send({ error: 'Email already exists' });
    user.email = req.body.email;
  }
  if (req.body.role) user.role = req.body.role;
  return user;
});

// Удаляем пользователя
server.delete('/api/users/:id', async (req, reply) => {
  const id = parseInt(req.params.id);
  const index = users.findIndex(u => u.id === id);
  if (index === -1) return reply.code(404).send({ error: 'User not found' });
  
  users.splice(index, 1);
  return { deleted: true };
});

// Запуск

const start = async () => {
  try {
    await server.listen({ port: 3000, host: '127.0.0.1' });
    console.log('Server running on http://127.0.0.1:3000');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

start();
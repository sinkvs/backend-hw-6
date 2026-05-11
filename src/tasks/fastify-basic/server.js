const Fastify = require('fastify');
const server = Fastify();

// GET / (базовый ответ)
server.get('/', async () => ({ message: 'Server is running' }));

// GET /health  (статус и время работы)
server.get('/health', async () => ({ status: 'ok', uptime: Math.floor(process.uptime()) }));

// GET /time (текущее время в двух форматах)
server.get('/time', async () => {
  const now = new Date();
  return { iso: now.toISOString(), unix: now.getTime() };
});

// Graceful shutdown (корректная остановка)
const shutdown = async () => {
  
  console.log(`${signal} received. Closing server...`);
  await server.close();
  console.log('Server closed.');
  process.exit(0);
};
process.on('SIGINT', () => shutdown('SIGINT'));   // Ctrl+C
process.on('SIGTERM', () => shutdown('SIGTERM')); // команда остановки

// Запуск
const start = async () => {
  try {
    await server.listen({ port: 3000, host: '127.0.0.1' }); 
    console.log('Server running: http://127.0.0.1:3000'); 
  } catch (err) {
    console.error('Failed to start:', err.message);
    process.exit(1);
  }
};

start();
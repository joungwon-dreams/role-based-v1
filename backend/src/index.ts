import { createServer } from './server';
import { serverConfig } from './config/app.config';

async function start() {
  try {
    const server = await createServer();

    await server.listen({
      port: serverConfig.port,
      host: serverConfig.host,
    });

    console.log(`🚀 Server is running on http://${serverConfig.host}:${serverConfig.port}`);
    console.log(`📡 tRPC endpoint: http://${serverConfig.host}:${serverConfig.port}/trpc`);
    console.log(`❤️  Health check: http://${serverConfig.host}:${serverConfig.port}/health`);
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();

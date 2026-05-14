import http from 'http';
import app from './app';
import { config } from './config';

const server = http.createServer(app);

// Note: For real-time updates on Vercel, we now use Firestore Listeners 
// rather than persistent Socket.io connections, ensuring 100% serverless compatibility.

// ─── Start Server ───────────────────────────
const startServer = async () => {
  try {
    server.listen(config.port, '0.0.0.0', () => {
      console.log(`
  ╔══════════════════════════════════════════════╗
  ║                                              ║
  ║   ✨ PrelovedByHira Cloud API Server         ║
  ║                                              ║
  ║   🌐 Server:  ${config.backendUrl.padEnd(27)}║
  ║   📦 Env:     ${config.nodeEnv.padEnd(27)}║
  ║   🚀 Status:  Vercel-Ready                   ║
  ║                                              ║
  ╚══════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Only run listen() in local development. 
// Vercel exports the app/server directly and handles the execution.
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  startServer();
}

export default app;

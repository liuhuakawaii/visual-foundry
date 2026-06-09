import { Hono } from 'hono'
import { cors } from 'hono/cors'
import generations from './routes/generations'

const app = new Hono()

app.use(
  '/*',
  cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
  }),
)

app.route('/api/generations', generations)

app.get('/api/health', (c) =>
  c.json({
    success: true,
    data: {
      service: 'Visual Foundry API',
      status: 'ok',
    },
  }),
)

export default app

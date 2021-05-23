import fastify from 'fastify'
import cookie from 'fastify-cookie'
import cors from 'fastify-cors'

const app = fastify({ logger: true })

app.register(cookie, {
  secret: 'my-secret', // for cookies signature
  parseOptions: {},
})
app.register(cors, {
  origin: 'http://localhost:4000',
  credentials: true,
})

app.get('/', async (request, reply) => {
  try {
    const result = reply.unsignCookie(request.cookies.myCookie)

    if (result.valid) {
      // Setting the same cookie again, this time plugin will sign it with a new key
      return { message: 'Hello Authorized User' }
    }
  } catch (e) {}

  return { message: 'Who are you again?' }
})

const createSessionSchema = {
  body: {
    type: 'object',
    properties: {
      name: { type: 'string' },
    },
  },
}

app.post(
  '/session',
  { schema: createSessionSchema },
  async (request, reply) => {
    const name = request.body.name

    if (name === 'jack') {
      reply
        .setCookie('my-session', 'some session value', {
          signed: true,
          httpOnly: true,
          sameSite: 'none',
          path: '/',
        })
        .send({ message: 'Access granted!', logged: true })
    } else {
      reply
        .clearCookie('my-session', {
          signed: true,
          httpOnly: true,
          sameSite: 'none',
          path: '/',
        })
        .send({ message: 'Who are you again?', logged: false })
    }
  },
)

try {
  await app.listen(3000, '127.0.0.1')
} catch (err) {
  app.log.error(err)
  process.exit(1)
}

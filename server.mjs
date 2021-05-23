import fastify from 'fastify'
import cookie from 'cookie'
// import cookie from 'fastify-cookie'
// import cors from 'fastify-cors'

const app = fastify({ logger: true })

const COOKIE_NAME = 'sticazzi';

// TODO this should be some kind of middleware but fuck that
function addAccessControlHeaders(request, reply) {
  reply
    .header('Access-Control-Allow-Origin', request.headers['origin'])
    .header('Access-Control-Allow-Credentials', 'true');
}

function makeCookie(value, expires) {
  return cookie.serialize(COOKIE_NAME, value, {
    signed: true,
    httpOnly: true,
    sameSite: 'none',
    path: '/',
    secure: true,
    expires
  });
}

app.options('/*', async (request, reply) => {
  addAccessControlHeaders(request, reply);
  reply
    .header('Access-Control-Allow-Methods', request.headers['access-control-request-method'])
    .header('Access-Control-Allow-Headers', request.headers['access-control-request-headers'])
    .send();
});

app.get('/', async (request, reply) => {
  addAccessControlHeaders(request, reply);
  const {[COOKIE_NAME]: c = null} = cookie.parse(request.headers.cookie || '');
  if (c) {
    return { message: `Hey ${c}` };
  }

  return { message: 'Unauthorized' };
})

app.post(
  '/login',
  async (request, reply) => {
    addAccessControlHeaders(request, reply);
    reply
      .header('Set-Cookie', makeCookie(request.body.name, new Date(Date.now() + 24*60*60*1000)))
      .send({ message: 'Access granted!', logged: true });
  }
);

app.get(
  '/logout',
  async (request, reply) => {
    addAccessControlHeaders(request, reply);
    reply
      .header('Set-Cookie', makeCookie('', new Date(0)))
      .send();
  }
);

app.listen(3000, '127.0.0.1').catch(e => {
  console.error(err);
  process.exit(1);
});
console.log('Listening on localhost:3000');

const Hapi = require('@hapi/hapi')
const Inert = require('@hapi/inert')
const Vision = require('@hapi/vision')
const HapiSwagger = require('hapi-swagger')
const Jwt = require('@hapi/jwt')

const ClientError = require('../../Commons/exceptions/ClientError')
const DomainErrorTranslator = require('../../Commons/exceptions/DomainErrorTranslator')

const users = require('../../Interfaces/http/api/users')
const authentications = require('../../Interfaces/http/api/authentications')
const threads = require('../../Interfaces/http/api/threads')
const comments = require('../../Interfaces/http/api/comments')
const replies = require('../../Interfaces/http/api/replies')
const commentLikes = require('../../Interfaces/http/api/comment_likes')

const createServer = async (container) => {
  const server = Hapi.server({
    host: process.env.HOST,
    port: process.env.PORT
  })

  await server.register([
    {
      plugin: Jwt
    },
    {
      plugin: Inert
    },
    {
      plugin: Vision
    },
    {
      plugin: HapiSwagger,
      options: {
        info: {
          title: 'Forum API Documentation',
          version: '1.0.0'
        },
        grouping: 'tags',
        deReference: true
      }
    }
  ])

  server.auth.strategy('forumapi_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id
      }
    })
  })

  server.route({
    method: 'GET',
    path: '/',
    handler: () => ({
      value: 'Hello World!'
    })
  })

  server.route({
    method: 'GET',
    path: '/about',
    handler: () => ({
      value: 'About'
    })
  })

  await server.register([
    {
      plugin: users,
      options: { container }
    },
    {
      plugin: authentications,
      options: { container }
    },
    {
      plugin: threads,
      options: { container }
    },
    {
      plugin: comments,
      options: { container }
    },
    {
      plugin: replies,
      options: { container }
    },
    {
      plugin: commentLikes,
      options: { container }
    }
  ])

  server.ext('onPreHandler', (request, h) => {
    request.route.settings.validate.failAction = 'ignore'
    request.route.settings.response.failAction = 'ignore'
    return h.continue
  })

  server.ext('onPreResponse', (request, h) => {
    const { response } = request

    if (response instanceof Error) {
      const translatedError = DomainErrorTranslator.translate(response)

      if (translatedError instanceof ClientError) {
        const newResponse = h.response({
          status: 'fail',
          message: translatedError.message
        })
        newResponse.code(translatedError.statusCode)
        return newResponse
      }

      if (!translatedError.isServer) {
        return h.continue
      }

      const newResponse = h.response({
        status: 'error',
        message: 'terjadi kegagalan pada server kami'
      })
      newResponse.code(500)
      return newResponse
    }

    return h.continue
  })

  return server
}

module.exports = createServer

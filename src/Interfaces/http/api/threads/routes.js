const Joi = require('joi')

const routes = (handler) => [
  {
    method: 'GET',
    path: '/threads/{threadId}',
    handler: handler.getThreadByIdHandler,
    options: {
      tags: ['api', 'threads'],
      response: {
        schema: Joi.object({
          status: 'success',
          data: {
            thread: 'thread'
          }
        })
      }
    }
  },
  {
    method: 'POST',
    path: '/threads',
    handler: handler.postThreadHandler,
    options: {
      auth: 'forumapi_jwt',
      tags: ['api', 'threads'],
      validate: {
        payload: Joi.object({
          title: Joi.string(),
          body: Joi.string()
        }),
        headers: Joi.object({
          authorization: Joi.string().required().description('access token')
        }).unknown()
      },
      response: {
        schema: Joi.object({
          status: 'success',
          message: 'Thread berhasil ditambahkan',
          data: {
            addedThread: {
              id: Joi.string(),
              title: Joi.string(),
              owner: Joi.string()
            }
          }
        })
      }
    }
  }
]

module.exports = routes

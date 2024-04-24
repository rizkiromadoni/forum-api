const Joi = require('joi')

const routes = (handler) => ([
  {
    method: 'POST',
    path: '/users',
    handler: handler.postUserHandler,
    options: {
      tags: ['api', 'users'],
      validate: {
        payload: Joi.object({
          username: Joi.string().required(),
          password: Joi.string().required(),
          fullname: Joi.string().required()
        })
      },
      response: {
        schema: Joi.object({
          status: 'success',
          data: {
            addedUser: Joi.object({
              id: Joi.string(),
              username: Joi.string(),
              fullname: Joi.string()
            })
          }
        })
      }
    }
  }
])

module.exports = routes

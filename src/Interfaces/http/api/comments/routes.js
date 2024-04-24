const Joi = require('joi')

const routes = (handler) => [
  {
    method: 'POST',
    path: '/threads/{threadId}/comments',
    handler: handler.postCommentHandler,
    options: {
      auth: 'forumapi_jwt',
      tags: ['api', 'comments'],
      validate: {
        params: Joi.object({
          threadId: Joi.string().required()
        }),
        payload: Joi.object({
          content: Joi.string().required(),
          owner: Joi.string().required()
        }),
        headers: Joi.object({
          authorization: Joi.string().required().description('access token')
        }).unknown(),
        failAction: 'ignore'
      },
      response: {
        schema: Joi.object({
          status: 'success',
          data: {
            addedComment: {
              id: Joi.string(),
              content: Joi.string(),
              owner: Joi.string()
            }
          }
        })
      }
    }
  },
  {
    method: 'DELETE',
    path: '/threads/{threadId}/comments/{commentId}',
    handler: handler.deleteCommentHandler,
    options: {
      auth: 'forumapi_jwt',
      tags: ['api', 'comments'],
      validate: {
        params: Joi.object({
          threadId: Joi.string().required(),
          commentId: Joi.string().required()
        }),
        headers: Joi.object({
          authorization: Joi.string().required().description('access token')
        }).unknown()
      },
      response: {
        schema: Joi.object({
          status: 'success'
        })
      }
    }
  }
]

module.exports = routes

const Joi = require('joi')

const routes = (handler) => [
  {
    method: 'POST',
    path: '/threads/{threadId}/comments/{commentId}/replies',
    handler: handler.postReplyHandler,
    options: {
      auth: 'forumapi_jwt',
      tags: ['api', 'replies'],
      validate: {
        params: Joi.object({
          threadId: Joi.string().required(),
          commentId: Joi.string().required()
        }),
        payload: Joi.object({
          content: Joi.string().required()
        }),
        headers: Joi.object({
          authorization: Joi.string().required().description('access token')
        }).unknown()
      },
      response: {
        schema: Joi.object({
          status: 'success',
          data: {
            addedReply: {
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
    path: '/threads/{threadId}/comments/{commentId}/replies/{replyId}',
    handler: handler.deleteReplyHandler,
    options: {
      auth: 'forumapi_jwt',
      tags: ['api', 'replies'],
      validate: {
        params: Joi.object({
          threadId: Joi.string().required(),
          commentId: Joi.string().required(),
          replyId: Joi.string().required()
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

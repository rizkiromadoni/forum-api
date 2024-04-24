const Joi = require('joi')

const routes = (handler) => [
  {
    method: 'PUT',
    path: '/threads/{threadId}/comments/{commentId}/likes',
    handler: handler.putCommentLikeHandler,
    options: {
      auth: 'forumapi_jwt',
      tags: ['api', 'comment_likes'],
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

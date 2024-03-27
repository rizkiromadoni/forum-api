const AddCommentUseCase = require('../../../../Applications/use_case/AddCommentUseCase')
const DeleteCommentUseCase = require('../../../../Applications/use_case/DeleteCommentUseCase')

class CommentHandler {
  constructor (container) {
    this._container = container

    this.postCommentHandler = this.postCommentHandler.bind(this)
    this.deleteCommentHandler = this.deleteCommentHandler.bind(this)
  }

  async postCommentHandler (request, h) {
    const { content } = request.payload
    const { threadId } = request.params
    const { id: userId } = request.auth.credentials

    const addCommentUseCase = this._container.getInstance(
      AddCommentUseCase.name
    )
    const addedComment = await addCommentUseCase.execute({
      content,
      threadId,
      owner: userId
    })

    const response = h.response({
      status: 'success',
      data: {
        addedComment
      }
    })
    response.code(201)
    return response
  }

  async deleteCommentHandler (request, h) {
    const { commentId, threadId } = request.params
    const { id: userId } = request.auth.credentials

    const deleteComment = this._container.getInstance(DeleteCommentUseCase.name)
    await deleteComment.execute({ commentId, threadId, owner: userId })

    return h.response({
      status: 'success'
    }).code(200)
  }
}

module.exports = CommentHandler

const AddReplyUseCase = require('../../../../Applications/use_case/AddReplyUseCase')
const DeleteReplyUseCase = require('../../../../Applications/use_case/DeleteReplyUseCase')

class RepliesHandler {
  constructor (container) {
    this._container = container

    this.postReplyHandler = this.postReplyHandler.bind(this)
    this.deleteReplyHandler = this.deleteReplyHandler.bind(this)
  }

  async postReplyHandler (request, h) {
    const addReplyUseCase = this._container.getInstance(AddReplyUseCase.name)

    const { threadId, commentId } = request.params
    const { content } = request.payload
    const { id: userId } = request.auth.credentials

    const addedReply = await addReplyUseCase.execute({
      content,
      threadId,
      commentId,
      owner: userId
    })

    const response = h.response({
      status: 'success',
      data: {
        addedReply
      }
    })
    response.code(201)
    return response
  }

  async deleteReplyHandler (request, h) {
    const { replyId, threadId, commentId } = request.params
    const { id: userId } = request.auth.credentials

    const deleteReplyUseCase = this._container.getInstance(DeleteReplyUseCase.name)

    await deleteReplyUseCase.execute({ replyId, threadId, commentId, owner: userId })

    return { status: 'success' }
  }
}

module.exports = RepliesHandler

const LikeUnlikeCommentUseCase = require('../../../../Applications/use_case/LikeUnlikeCommentUseCase')

class CommentLikeHandler {
  constructor (container) {
    this._container = container

    this.putCommentLikeHandler = this.putCommentLikeHandler.bind(this)
  }

  async putCommentLikeHandler (request, h) {
    const likeUnlikeCommentUseCase = this._container.getInstance(LikeUnlikeCommentUseCase.name)

    const { threadId, commentId } = request.params
    const { id: userId } = request.auth.credentials

    const useCasePayload = {
      threadId,
      commentId,
      owner: userId
    }
    await likeUnlikeCommentUseCase.execute(useCasePayload)

    return { status: 'success' }
  }
}

module.exports = CommentLikeHandler

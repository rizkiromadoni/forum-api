class LikeUnlikeCommentUseCase {
  constructor ({ threadRepository, commentRepository, commentLikeRepository }) {
    this._threadRepository = threadRepository
    this._commentRepository = commentRepository
    this._commentLikeRepository = commentLikeRepository
  }

  async execute (useCasePayload) {
    const { commentId, threadId, owner } = useCasePayload

    await this._threadRepository.verifyThreadAvailability(threadId)
    await this._commentRepository.verifyCommentAvailability(commentId, threadId)
    const isCommentAlreadyLiked = await this._commentLikeRepository.isCommentAlreadyLiked(commentId, owner)

    if (isCommentAlreadyLiked) {
      return this._commentLikeRepository.unlikeComment(commentId, owner)
    }

    return this._commentLikeRepository.likeComment(commentId, owner)
  }
}

module.exports = LikeUnlikeCommentUseCase

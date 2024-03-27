const AddReply = require('../../Domains/replies/entities/AddReply')

class AddReplyUsecase {
  constructor ({ replyRepository, commentRepository, threadRepository }) {
    this._replyRepository = replyRepository
    this._commentRepository = commentRepository
    this._threadRepository = threadRepository
  }

  async execute (useCasePayload) {
    const newReply = new AddReply(useCasePayload)
    await this._threadRepository.verifyThreadAvailability(useCasePayload.threadId)
    await this._commentRepository.verifyCommentAvailability(useCasePayload.commentId, useCasePayload.threadId)
    return await this._replyRepository.addReply(newReply)
  }
}

module.exports = AddReplyUsecase

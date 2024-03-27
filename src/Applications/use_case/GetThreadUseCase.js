class GetThreadUseCase {
  constructor ({ threadRepository, commentRepository, replyRepository, commentLikeRepository }) {
    this._threadRepository = threadRepository
    this._commentRepository = commentRepository
    this._replyRepository = replyRepository
    this._commentLikeRepository = commentLikeRepository
  }

  async execute (threadId) {
    const thread = await this._threadRepository.getThreadById(threadId)
    let comments = await this._commentRepository.getCommentsByThreadId(threadId)
    const replies = await this._replyRepository.getRepliesByThreadId(threadId)
    const commentLikes = await this._commentLikeRepository.getCommentLikesByThreadId(threadId)

    comments = comments.map((comment) => ({
      id: comment.id,
      content: comment.is_deleted ? '**komentar telah dihapus**' : comment.content,
      username: comment.username,
      date: comment.date,
      likeCount: commentLikes.filter(like => like.comment_id === comment.id).length,
      replies: replies.filter(reply => reply.comment_id === comment.id).map((reply) => ({
        id: reply.id,
        content: reply.is_deleted ? '**balasan telah dihapus**' : reply.content,
        username: reply.username,
        date: reply.date
      }))
    }))

    return { ...thread, comments }
  }
}

module.exports = GetThreadUseCase

const CommentLikeRepository = require('../../Domains/comment_likes/CommentLikeRepository')

class CommentLikeRepositoryPostgres extends CommentLikeRepository {
  constructor (pool, idGenerator) {
    super()
    this._pool = pool
    this._idGenerator = idGenerator
  }

  async isCommentAlreadyLiked (commentId, owner) {
    const query = {
      text: 'SELECT id FROM comment_likes WHERE comment_id = $1 AND owner = $2',
      values: [commentId, owner]
    }

    const { rowCount } = await this._pool.query(query)
    return rowCount > 0
  }

  async likeComment (commentId, owner) {
    const id = `comment-like-${this._idGenerator()}`

    const query = {
      text: 'INSERT INTO comment_likes VALUES($1, $2, $3)',
      values: [id, commentId, owner]
    }

    const { rowCount } = await this._pool.query(query)
    return rowCount
  }

  async unlikeComment (commentId, owner) {
    const query = {
      text: 'DELETE FROM comment_likes WHERE comment_id = $1 AND owner = $2',
      values: [commentId, owner]
    }

    const { rowCount } = await this._pool.query(query)
    return rowCount
  }

  async getCommentLikesByThreadId (threadId) {
    const query = {
      text: 'SELECT id, comment_id FROM comment_likes WHERE comment_id IN (SELECT id FROM comments WHERE thread_id = $1)',
      values: [threadId]
    }

    const { rows } = await this._pool.query(query)
    return rows
  }
}

module.exports = CommentLikeRepositoryPostgres

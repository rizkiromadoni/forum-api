const CommentRepository = require('../../Domains/comments/CommentRepository')
const AddedComment = require('../../Domains/comments/entities/AddedComment')

const AuthorizationError = require('../../Commons/exceptions/AuthorizationError')
const NotFoundError = require('../../Commons/exceptions/NotFoundError')

class CommentRepositoryPostgres extends CommentRepository {
  constructor (pool, idGenerator) {
    super()
    this._pool = pool
    this._idGenerator = idGenerator
  }

  async addComment (payload) {
    const { threadId, content, owner } = payload

    const id = `comment-${this._idGenerator()}`
    const date = new Date().toISOString()

    const query = {
      text: 'INSERT INTO comments VALUES($1, $2, $3, $4, $5) RETURNING id, content, owner',
      values: [id, content, threadId, owner, date]
    }

    const result = await this._pool.query(query)

    return new AddedComment(result.rows[0])
  }

  async getCommentsByThreadId (threadId) {
    const query = {
      text: `SELECT comments.*, users.username
      FROM comments LEFT JOIN users ON comments.owner = users.id
      WHERE comments.thread_id = $1 ORDER BY comments.date ASC`,
      values: [threadId]
    }

    const { rows } = await this._pool.query(query)
    return rows
  }

  async verifyCommentOwner (commentId, owner) {
    const query = {
      text: 'SELECT id FROM comments WHERE id = $1 AND owner = $2',
      values: [commentId, owner]
    }

    const { rowCount } = await this._pool.query(query)

    if (!rowCount) throw new AuthorizationError('anda tidak berhak mengakses resource ini')
    return rowCount
  }

  async verifyCommentAvailability (commentId, threadId) {
    const query = {
      text: 'SELECT id FROM comments WHERE id = $1 AND thread_id = $2 AND is_deleted = false',
      values: [commentId, threadId]
    }

    const { rowCount } = await this._pool.query(query)

    if (!rowCount) throw new NotFoundError('komentar tidak ditemukan')
    return rowCount
  }

  async deleteCommentById (commentId) {
    const query = {
      text: 'UPDATE comments SET is_deleted = true WHERE id = $1',
      values: [commentId]
    }

    const { rowCount } = await this._pool.query(query)

    if (!rowCount) throw new NotFoundError('komentar tidak ditemukan')
    return rowCount
  }
}

module.exports = CommentRepositoryPostgres

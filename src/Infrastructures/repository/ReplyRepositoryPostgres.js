const ReplyRepository = require('../../Domains/replies/ReplyRepository')
const AddedReply = require('../../Domains/replies/entities/AddedReply')

const NotFoundError = require('../../Commons/exceptions/NotFoundError')
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError')

class ReplyRepositoryPostgres extends ReplyRepository {
  constructor (pool, idGenerator) {
    super()
    this._pool = pool
    this._idGenerator = idGenerator
  }

  async addReply (payload) {
    const { commentId, content, owner } = payload
    const id = `reply-${this._idGenerator()}`
    const date = new Date().toISOString()

    const query = {
      text: 'INSERT INTO replies VALUES($1, $2, $3, $4, $5, $6) RETURNING id, content, owner',
      values: [id, content, commentId, owner, date, false]
    }

    const { rows } = await this._pool.query(query)
    return new AddedReply(rows[0])
  }

  async getRepliesByThreadId (threadId) {
    const query = {
      text: `SELECT replies.*, users.username FROM replies
      LEFT JOIN users ON replies.owner = users.id
      LEFT JOIN comments ON replies.comment_id = comments.id
      WHERE comments.thread_id = $1 ORDER BY replies.date ASC`,
      values: [threadId]
    }

    const { rows } = await this._pool.query(query)
    return rows
  }

  async verifyReplyAvailability (replyId, commentId, threadId) {
    const query = {
      text: `SELECT replies.id FROM replies
      LEFT JOIN comments ON replies.comment_id = comments.id
      WHERE replies.id = $1 AND comments.id = $2 AND comments.thread_id = $3 AND replies.is_deleted = false`,
      values: [replyId, commentId, threadId]
    }

    const { rowCount } = await this._pool.query(query)
    if (!rowCount) throw new NotFoundError('balasan tidak ditemukan')

    return rowCount
  }

  async verifyReplyOwner (replyId, owner) {
    const query = {
      text: 'SELECT id FROM replies WHERE id = $1 AND owner = $2',
      values: [replyId, owner]
    }

    const { rowCount } = await this._pool.query(query)
    if (!rowCount) throw new AuthorizationError('Anda tidak berhak mengakses resource ini')

    return rowCount
  }

  async deleteReplyById (replyId) {
    const query = {
      text: 'UPDATE replies SET is_deleted = true WHERE id = $1',
      values: [replyId]
    }

    const { rowCount } = await this._pool.query(query)
    if (!rowCount) throw new NotFoundError('balasan tidak ditemukan')
    return rowCount
  }
}

module.exports = ReplyRepositoryPostgres

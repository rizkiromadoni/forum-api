/* istanbul ignore file */

const pool = require('../src/Infrastructures/database/postgres/pool')

const CommentLikesTableTestHelper = {
  async likeComment ({
    id = 'comment-like-123',
    commentId = 'comment-123',
    userId = 'user-123'
  }) {
    const query = {
      text: 'INSERT INTO comment_likes VALUES($1, $2, $3)',
      values: [id, commentId, userId]
    }

    await pool.query(query)
  },

  async unLikeCommentById (id) {
    const query = {
      text: 'DELETE FROM comment_likes WHERE id = $1',
      values: [id]
    }

    await pool.query(query)
  },

  async isCommentLiked (commentId, userId) {
    const query = {
      text: 'SELECT id FROM comment_likes WHERE comment_id = $1 AND owner = $2',
      values: [commentId, userId]
    }

    const { rowCount } = await pool.query(query)
    return rowCount
  },

  async getCommentLikesByCommentId (commentId) {
    const query = {
      text: 'SELECT * FROM comment_likes WHERE comment_id = $1',
      values: [commentId]
    }

    const { rows } = await pool.query(query)
    return rows
  },

  async cleanTable () {
    await pool.query('DELETE FROM comment_likes WHERE 1=1')
  }
}

module.exports = CommentLikesTableTestHelper

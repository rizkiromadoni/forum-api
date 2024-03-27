const pool = require('../../database/postgres/pool')
const container = require('../../container')
const createServer = require('../createServer')

const UserAuthenticationTestHelper = require('../../../../tests/UserAuthenticationTestHelper')
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper')
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper')
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper')
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper')
const CommentLikesTableTestHelper = require('../../../../tests/CommentLikesTableTestHelper')

describe('comment likes endpoint', () => {
  let server, accessToken, userId
  const [threadId, commentId] = ['thread-123', 'comment-123']

  beforeAll(async () => {
    server = await createServer(container)
    const users = await UserAuthenticationTestHelper.generateUserAuthentication(server)

    accessToken = users.accessToken
    userId = users.userId

    await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId })
    await CommentsTableTestHelper.addComment({ id: commentId, threadId, owner: userId })
  })

  afterAll(async () => {
    await UsersTableTestHelper.cleanTable()
    await AuthenticationsTableTestHelper.cleanTable()
    await ThreadsTableTestHelper.cleanTable()
    await CommentsTableTestHelper.cleanTable()
    await CommentLikesTableTestHelper.cleanTable()
    await pool.end()
  })

  afterEach(async () => {
    await CommentLikesTableTestHelper.cleanTable()
  })

  describe('when PUT /threads/{threadId}/comments/{commentId}/likes', () => {
    it('should response 401 when request does not contain valid access token', async () => {
      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${threadId}/comments/${commentId}/likes`
      })

      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(401)
      expect(responseJson.error).toEqual('Unauthorized')
      expect(responseJson.message).toEqual('Missing authentication')
    })

    it('should response 404 when thread not found', async () => {
      const response = await server.inject({
        method: 'PUT',
        url: `/threads/thread-xyz/comments/${commentId}/likes`,
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(404)
      expect(responseJson.status).toEqual('fail')
      expect(responseJson.message).toEqual('thread tidak ditemukan')
    })

    it('should response 404 when comment not found', async () => {
      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${threadId}/comments/comment-xyz/likes`,
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(404)
      expect(responseJson.status).toEqual('fail')
      expect(responseJson.message).toEqual('komentar tidak ditemukan')
    })

    it('should response 200 when comment is liked', async () => {
      await CommentLikesTableTestHelper.likeComment({ commentId, userId })

      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${threadId}/comments/${commentId}/likes`,
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(200)
      expect(responseJson.status).toEqual('success')
    })

    it('should response 200 when comment is unliked', async () => {
      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${threadId}/comments/${commentId}/likes`,
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(200)
      expect(responseJson.status).toEqual('success')
    })
  })
})

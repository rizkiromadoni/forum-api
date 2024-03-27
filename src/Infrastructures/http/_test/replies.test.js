const pool = require('../../database/postgres/pool')
const container = require('../../container')
const createServer = require('../createServer')

const UserAuthenticationTestHelper = require('../../../../tests/UserAuthenticationTestHelper')
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper')
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper')
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper')
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper')
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper')

describe('replies endpoint', () => {
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
    await pool.end()
  })

  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable()
  })

  describe('when POST /threads/{threadId}/comments/{commentId}/replies', () => {
    it('should response 401 when request does not contain valid access token', async () => {
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: {
          content: 'some reply'
        }
      })

      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(401)
      expect(responseJson.error).toEqual('Unauthorized')
      expect(responseJson.message).toEqual('Missing authentication')
    })

    it('should response 404 when thread not found', async () => {
      const response = await server.inject({
        method: 'POST',
        url: `/threads/thread-xyz/comments/${commentId}/replies`,
        payload: {
          content: 'some reply'
        },
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
        method: 'POST',
        url: `/threads/${threadId}/comments/comment-xyz/replies`,
        payload: {
          content: 'some reply'
        },
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(404)
      expect(responseJson.status).toEqual('fail')
      expect(responseJson.message).toEqual('komentar tidak ditemukan')
    })

    it('should response 400 when payload not contain needed property', async () => {
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: {
          content: ''
        },
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(400)
      expect(responseJson.status).toEqual('fail')
      expect(responseJson.message).toEqual('tidak dapat membuat reply baru karena properti yang dibutuhkan tidak ada')
    })

    it('should response 400 when payload not meet data type specification', async () => {
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: {
          content: 123
        },
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(400)
      expect(responseJson.status).toEqual('fail')
      expect(responseJson.message).toEqual('tidak dapat membuat reply baru karena tipe data tidak sesuai')
    })

    it('should response 201 and persisted reply correctly', async () => {
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: {
          content: 'some reply'
        },
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(201)
      expect(responseJson.status).toEqual('success')
      expect(responseJson.data).toBeDefined()
      expect(responseJson.data.addedReply).toBeDefined()
      expect(responseJson.data.addedReply.id).toBeDefined()
      expect(responseJson.data.addedReply.content).toBeDefined()
      expect(responseJson.data.addedReply.owner).toBeDefined()
    })
  })

  describe('when DELETE /threads/{threadId}/comments/{commentId}/replies/{replyId}', () => {
    it('should response 401 when request does not contain valid access token', async () => {
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/reply-123`
      })

      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(401)
      expect(responseJson.error).toEqual('Unauthorized')
      expect(responseJson.message).toEqual('Missing authentication')
    })

    it('should response 404 when reply not found', async () => {
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/reply-xyz`,
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(404)
      expect(responseJson.status).toEqual('fail')
      expect(responseJson.message).toEqual('balasan tidak ditemukan')
    })

    it('should response 404 when comment not found', async () => {
      await RepliesTableTestHelper.addReply({ id: 'reply-123', comment_id: commentId, owner: userId })

      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/comment-xyz/replies/reply-123`,
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(404)
      expect(responseJson.status).toEqual('fail')
      expect(responseJson.message).toEqual('balasan tidak ditemukan')
    })

    it('should response 404 when thread not found', async () => {
      await RepliesTableTestHelper.addReply({ id: 'reply-123', comment_id: commentId, owner: userId })

      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/thread-xyz/comments/${commentId}/replies/reply-123`,
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(404)
      expect(responseJson.status).toEqual('fail')
      expect(responseJson.message).toEqual('balasan tidak ditemukan')
    })

    it('should response 403 when reply not owned by user', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-123' })
      await RepliesTableTestHelper.addReply({ id: 'reply-123', comment_id: commentId, owner: 'user-123' })

      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/reply-123`,
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(403)
      expect(responseJson.status).toEqual('fail')
      expect(responseJson.message).toEqual('Anda tidak berhak mengakses resource ini')
    })

    it('should response 200 and delete reply correctly', async () => {
      await RepliesTableTestHelper.addReply({ id: 'reply-123', comment_id: commentId, owner: userId })

      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/reply-123`,
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

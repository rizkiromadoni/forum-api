const pool = require('../../database/postgres/pool')
const container = require('../../container')
const createServer = require('../createServer')

const UserAuthenticationTestHelper = require('../../../../tests/UserAuthenticationTestHelper')
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper')
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper')
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper')

describe('/threads endpoint', () => {
  let server, accessToken, userId

  beforeAll(async () => {
    server = await createServer(container)
    const users = await UserAuthenticationTestHelper.generateUserAuthentication(server)

    accessToken = users.accessToken
    userId = users.userId
  })

  afterAll(async () => {
    await AuthenticationsTableTestHelper.cleanTable()
    await UsersTableTestHelper.cleanTable()
    await pool.end()
  })

  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable()
  })

  describe('when POST /threads', () => {
    it('should return 401 when request does not contain valid access token', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: 'A Thread',
          body: 'A thread body'
        }
      })

      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(401)
      expect(responseJson.error).toEqual('Unauthorized')
      expect(responseJson.message).toEqual('Missing authentication')
    })

    it('should return 400 when payload not contain needed property', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          body: 'A thread body'
        },
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(400)
      expect(responseJson.status).toEqual('fail')
      expect(responseJson.message).toEqual(
        'tidak dapat membuat thread baru karena properti yang dibutuhkan tidak ada'
      )
    })

    it('should return 400 when payload not meet data type specification', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: 123,
          body: 456
        },
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(400)
      expect(responseJson.status).toEqual('fail')
      expect(responseJson.message).toEqual(
        'tidak dapat membuat thread baru karena tipe data tidak sesuai'
      )
    })

    it('should return 201 and persisted thread', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: 'A Thread',
          body: 'A thread body'
        },
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(201)
      expect(responseJson.status).toEqual('success')
      expect(responseJson.data.addedThread).toBeDefined()
    })
  })

  describe('when GET /threads/{threadId}', () => {
    it('should return 404 when thread not found', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/threads/thread-xyz'
      })

      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(404)
      expect(responseJson.status).toEqual('fail')
      expect(responseJson.message).toEqual('thread tidak ditemukan')
    })

    it('should return 200 and persisted thread', async () => {
      const threadId = 'thread-123'
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId })

      const response = await server.inject({
        method: 'GET',
        url: `/threads/${threadId}`
      })

      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(200)
      expect(responseJson.status).toEqual('success')
      expect(responseJson.data.thread).toBeDefined()
      expect(responseJson.data.thread.id).toBeDefined()
      expect(responseJson.data.thread.title).toBeDefined()
      expect(responseJson.data.thread.body).toBeDefined()
      expect(responseJson.data.thread.date).toBeDefined()
      expect(responseJson.data.thread.username).toBeDefined()
      expect(responseJson.data.thread.comments).toBeDefined()
    })
  })
})

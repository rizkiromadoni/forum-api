const pool = require('../../../Infrastructures/database/postgres/pool')

const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper')
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper')

const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres')
const AddThread = require('../../../Domains/threads/entities/AddThread')
const AddedThread = require('../../../Domains/threads/entities/AddedThread')

const NotFoundError = require('../../../Commons/exceptions/NotFoundError')

describe('ThreadRepositoryPostgres', () => {
  beforeAll(async () => {
    await UsersTableTestHelper.addUser({ id: 'user-123', username: 'rizkiromadoni' })
  })

  afterAll(async () => {
    await UsersTableTestHelper.cleanTable()
    await pool.end()
  })

  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable()
  })

  const fakeIdGenerator = () => '123'
  const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator)

  describe('addThread function', () => {
    it('should persist add thread and return correctly', async () => {
      const newThread = new AddThread({
        title: 'A Thread',
        body: 'A thread body',
        owner: 'user-123'
      })

      const expectedAddedThread = new AddedThread({
        id: 'thread-123',
        title: 'A Thread',
        owner: 'user-123'
      })

      const addedThread = await threadRepositoryPostgres.addThread(newThread)

      const threads = await ThreadsTableTestHelper.findThreadsById('thread-123')
      expect(threads).toHaveLength(1)
      expect(addedThread).toStrictEqual(expectedAddedThread)
    })
  })

  describe('verifyThreadAvailability function', () => {
    it('should throw NotFoundError when thread not exist', async () => {
      await expect(threadRepositoryPostgres.verifyThreadAvailability('thread-123')).rejects.toThrowError(NotFoundError)
    })

    it('should not throw NotFoundError when thread exist and return correctly', async () => {
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' })

      await expect(threadRepositoryPostgres.verifyThreadAvailability('thread-123')).resolves.not.toThrowError(NotFoundError)
      await expect(threadRepositoryPostgres.verifyThreadAvailability('thread-123')).resolves.toStrictEqual(1)
    })
  })

  describe('getThreadById function', () => {
    it('should throw NotFoundError when thread not exist', async () => {
      await expect(threadRepositoryPostgres.getThreadById('thread-xyz')).rejects.toThrowError(NotFoundError)
    })

    it('should not throw NotFoundError when thread exist and return thread correctly', async () => {
      const expectedResult = {
        id: 'thread-123',
        title: 'A Thread',
        body: 'thread content',
        date: new Date('2024-03-21T20:52:57.040Z'),
        username: 'rizkiromadoni'
      }

      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'A Thread',
        body: 'thread content',
        owner: 'user-123',
        date: new Date('2024-03-21T20:52:57.040Z')
      })

      await expect(threadRepositoryPostgres.getThreadById('thread-123')).resolves.not.toThrowError(NotFoundError)
      await expect(threadRepositoryPostgres.getThreadById('thread-123')).resolves.toStrictEqual(expectedResult)
    })
  })
})

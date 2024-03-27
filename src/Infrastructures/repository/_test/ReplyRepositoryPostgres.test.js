const pool = require('../../database/postgres/pool')
const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres')

const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper')
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper')
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper')
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper')

const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError')
const NotFoundError = require('../../../Commons/exceptions/NotFoundError')

const AddReply = require('../../../Domains/replies/entities/AddReply')
const AddedReply = require('../../../Domains/replies/entities/AddedReply')

describe('ReplyRepositoryPostgres', () => {
  beforeAll(async () => {
    await UsersTableTestHelper.addUser({
      id: 'user-123',
      username: 'rizkiromadoni'
    })
    await ThreadsTableTestHelper.addThread({
      id: 'thread-123',
      title: 'A Thread',
      body: 'A thread body',
      owner: 'user-123'
    })
    await CommentsTableTestHelper.addComment({
      id: 'comment-123',
      content: 'some comment',
      threadId: 'thread-123',
      owner: 'user-123'
    })
  })

  afterAll(async () => {
    await RepliesTableTestHelper.cleanTable()
    await CommentsTableTestHelper.cleanTable()
    await ThreadsTableTestHelper.cleanTable()
    await UsersTableTestHelper.cleanTable()
    await pool.end()
  })

  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable()
  })

  const fakeIdGenerator = () => '123'
  const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator)

  describe('addReply function', () => {
    it('should presist reply and return added reply correctly', async () => {
      const newReply = new AddReply({
        commentId: 'comment-123',
        content: 'some reply',
        owner: 'user-123'
      })

      const expectedAddedReply = new AddedReply({
        id: 'reply-123',
        content: 'some reply',
        owner: 'user-123'
      })

      const addedReply = await replyRepositoryPostgres.addReply(newReply)
      const replies = await RepliesTableTestHelper.getReplyById('reply-123')

      expect(replies).toHaveLength(1)
      expect(addedReply).toStrictEqual(expectedAddedReply)
    })
  })

  describe('getRepliesByThreadId function', () => {
    it('should return replies correctly', async () => {
      const expectedResult = [
        {
          id: 'reply-123',
          content: 'reply one',
          comment_id: 'comment-123',
          owner: 'user-123',
          date: new Date('2024-03-21T20:52:57.040Z'),
          is_deleted: false,
          username: 'rizkiromadoni'
        },
        {
          id: 'reply-234',
          content: 'reply two',
          comment_id: 'comment-123',
          owner: 'user-123',
          date: new Date('2024-03-21T21:52:57.040Z'),
          is_deleted: false,
          username: 'rizkiromadoni'
        }
      ]

      await RepliesTableTestHelper.addReply({
        id: 'reply-123',
        commentId: 'comment-123',
        content: 'reply one',
        owner: 'user-123',
        date: new Date('2024-03-21T20:52:57.040Z')
      })
      await RepliesTableTestHelper.addReply({
        id: 'reply-234',
        commentId: 'comment-123',
        content: 'reply two',
        owner: 'user-123',
        date: new Date('2024-03-21T21:52:57.040Z')
      })

      const replies = await replyRepositoryPostgres.getRepliesByThreadId('thread-123')

      expect(replies).toHaveLength(2)
      expect(replies).toStrictEqual(expectedResult)
    })
  })

  describe('verifyReplyAvailability function', () => {
    it('should throw NotFoundError when reply not found', async () => {
      await expect(replyRepositoryPostgres.verifyReplyAvailability('reply-123', 'comment-123', 'thread-123')).rejects.toThrowError(NotFoundError)
    })

    it('should not throw NotFoundError when reply is exist and return correctly', async () => {
      await RepliesTableTestHelper.addReply({
        id: 'reply-123',
        commentId: 'comment-123',
        content: 'some reply',
        owner: 'user-123'
      })

      await expect(replyRepositoryPostgres.verifyReplyAvailability('reply-123', 'comment-123', 'thread-123')).resolves.not.toThrowError(NotFoundError)
      await expect(replyRepositoryPostgres.verifyReplyAvailability('reply-123', 'comment-123', 'thread-123')).resolves.toEqual(1)
    })
  })

  describe('verifyReplyOwner function', () => {
    it('should throw AuthorizationError when reply not owned by user', async () => {
      await RepliesTableTestHelper.addReply({
        id: 'reply-123',
        commentId: 'comment-123',
        content: 'some reply',
        owner: 'user-123'
      })

      await expect(replyRepositoryPostgres.verifyReplyOwner('reply-123', 'user-456')).rejects.toThrowError(AuthorizationError)
    })

    it('should not throw AuthorizationError when reply owned by user and return correctly', async () => {
      await RepliesTableTestHelper.addReply({
        id: 'reply-123',
        commentId: 'comment-123',
        content: 'some reply',
        owner: 'user-123'
      })

      await expect(replyRepositoryPostgres.verifyReplyOwner('reply-123', 'user-123')).resolves.not.toThrowError(AuthorizationError)
      await expect(replyRepositoryPostgres.verifyReplyOwner('reply-123', 'user-123')).resolves.toEqual(1)
    })
  })

  describe('deleteReplyById function', () => {
    it('should throw NotFoundError when reply not found', async () => {
      await expect(replyRepositoryPostgres.deleteReplyById('reply-123')).rejects.toThrowError(NotFoundError)
    })

    it('should presist delete reply and return correctly', async () => {
      await RepliesTableTestHelper.addReply({
        id: 'reply-123',
        commentId: 'comment-123',
        content: 'reply one',
        owner: 'user-123'
      })

      const result = await replyRepositoryPostgres.deleteReplyById('reply-123')

      const replies = await RepliesTableTestHelper.getReplyById('reply-123')
      expect(result).toEqual(1)
      expect(replies).toHaveLength(1)
      expect(replies[0].is_deleted).toEqual(true)
    })
  })
})

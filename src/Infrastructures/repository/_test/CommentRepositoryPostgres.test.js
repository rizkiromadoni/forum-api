const pool = require('../../database/postgres/pool')

const CommentRepositoryPostgres = require('../CommentRepositoryPostgres')

const AddComment = require('../../../Domains/comments/entities/AddComment')
const AddedComment = require('../../../Domains/comments/entities/AddedComment')

const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper')
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper')
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper')

const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError')
const NotFoundError = require('../../../Commons/exceptions/NotFoundError')

describe('CommentRepositoryPostgres', () => {
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
  })

  afterAll(async () => {
    await CommentsTableTestHelper.cleanTable()
    await ThreadsTableTestHelper.cleanTable()
    await UsersTableTestHelper.cleanTable()
    await pool.end()
  })

  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable()
  })

  const fakeIdGenerator = () => '123'
  const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator)

  describe('addComment function', () => {
    it('should presist add comment and return correctly', async () => {
      const newComment = new AddComment({
        content: 'some comment',
        threadId: 'thread-123',
        owner: 'user-123'
      })

      const expectedAddedComment = new AddedComment({
        id: 'comment-123',
        content: 'some comment',
        owner: 'user-123'
      })

      const addedComment = await commentRepositoryPostgres.addComment(newComment)

      const comments = await CommentsTableTestHelper.getCommentById('comment-123')
      expect(comments).toHaveLength(1)
      expect(addedComment).toStrictEqual(expectedAddedComment)
    })
  })

  describe('verifyCommentOwner function', () => {
    it('should throw AuthorizationError when comment owner is not equal to owner', async () => {
      await CommentsTableTestHelper.addComment({ id: 'comment-123', owner: 'user-123' })

      await expect(commentRepositoryPostgres.verifyCommentOwner('comment-123', 'user-456')).rejects.toThrowError(AuthorizationError)
    })

    it('should not throw AuthorizationError when comment owner is equal to owner and return correctly', async () => {
      await CommentsTableTestHelper.addComment({ id: 'comment-123', owner: 'user-123' })

      await expect(commentRepositoryPostgres.verifyCommentOwner('comment-123', 'user-123')).resolves.not.toThrowError(AuthorizationError)
      await expect(commentRepositoryPostgres.verifyCommentOwner('comment-123', 'user-123')).resolves.toEqual(1)
    })
  })

  describe('verifyCommentAvailability function', () => {
    it('should throw NotFoundError when comment is not found', async () => {
      await expect(commentRepositoryPostgres.verifyCommentAvailability('comment-123', 'thread-123')).rejects.toThrowError(NotFoundError)
    })

    it('should not throw NotFoundError when comment is found and return correctly', async () => {
      await CommentsTableTestHelper.addComment({ id: 'comment-123' })

      await expect(commentRepositoryPostgres.verifyCommentAvailability('comment-123', 'thread-123')).resolves.not.toThrowError(NotFoundError)
      await expect(commentRepositoryPostgres.verifyCommentAvailability('comment-123', 'thread-123')).resolves.toEqual(1)
    })
  })

  describe('getCommentsByThreadId function', () => {
    it('should return comments correctly', async () => {
      const expectedResult = [
        {
          id: 'comment-123',
          content: 'comment one',
          thread_id: 'thread-123',
          owner: 'user-123',
          date: new Date('2024-03-21T20:52:57.040Z'),
          is_deleted: false,
          username: 'rizkiromadoni'
        },
        {
          id: 'comment-456',
          content: 'comment two',
          thread_id: 'thread-123',
          owner: 'user-123',
          date: new Date('2024-03-21T23:52:57.040Z'),
          is_deleted: false,
          username: 'rizkiromadoni'
        }
      ]

      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        threadId: 'thread-123',
        owner: 'user-123',
        content: 'comment one',
        date: new Date('2024-03-21T20:52:57.040Z')
      })
      await CommentsTableTestHelper.addComment({
        id: 'comment-456',
        threadId: 'thread-123',
        owner: 'user-123',
        content: 'comment two',
        date: new Date('2024-03-21T23:52:57.040Z')
      })

      const comments = await commentRepositoryPostgres.getCommentsByThreadId('thread-123')

      expect(comments).toHaveLength(2)
      expect(comments).toStrictEqual(expectedResult)
    })
  })

  describe('deleteCommentById function', () => {
    it('should throw NotFoundError when comment is not found', async () => {
      await expect(commentRepositoryPostgres.deleteCommentById('comment-123')).rejects.toThrowError(NotFoundError)
    })

    it('should presist delete comment and return correctly', async () => {
      await CommentsTableTestHelper.addComment({ id: 'comment-123' })
      const result = await commentRepositoryPostgres.deleteCommentById('comment-123')

      const comment = await CommentsTableTestHelper.getCommentById('comment-123')
      expect(result).toEqual(1)
      expect(comment[0].is_deleted).toEqual(true)
    })
  })
})

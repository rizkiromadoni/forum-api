const pool = require('../../database/postgres/pool')
const CommentLikeRepositoryPostgres = require('../CommentLikeRepositoryPostgres')

const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper')
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper')
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper')
const CommentLikesTableTestHelper = require('../../../../tests/CommentLikesTableTestHelper')

describe('CommentLikeRepositoryPostgres', () => {
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
      content: 'A comment',
      owner: 'user-123',
      threadId: 'thread-123'
    })
  })

  afterAll(async () => {
    await UsersTableTestHelper.cleanTable()
    await ThreadsTableTestHelper.cleanTable()
    await CommentsTableTestHelper.cleanTable()
    await pool.end()
  })

  afterEach(async () => {
    await CommentLikesTableTestHelper.cleanTable()
  })

  const fakeIdGenerator = () => '123'
  const commentLikeRepositoryPostgres = new CommentLikeRepositoryPostgres(pool, fakeIdGenerator)

  describe('likeComment function', () => {
    it('should persist like comment and return correctly', async () => {
      const likeComment = await commentLikeRepositoryPostgres.likeComment('comment-123', 'user-123')

      const commentLikes = await CommentLikesTableTestHelper.getCommentLikesByCommentId('comment-123')
      expect(likeComment).toEqual(1)
      expect(commentLikes).toHaveLength(1)
    })
  })

  describe('isCommentAlreadyLiked function', () => {
    it('should return falsy when comment not liked', async () => {
      await expect(commentLikeRepositoryPostgres.isCommentAlreadyLiked('comment-123', 'user-123')).resolves.toBeFalsy()
    })

    it('should return truthy when comment liked', async () => {
      await CommentLikesTableTestHelper.likeComment({ commentId: 'comment-123', owner: 'user-123' })

      await expect(commentLikeRepositoryPostgres.isCommentAlreadyLiked('comment-123', 'user-123')).resolves.toBeTruthy()
    })
  })

  describe('getCommentLikesByThreadId function', () => {
    it('should return correct likes', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-456', username: 'rizkiromadoni2' })

      await CommentLikesTableTestHelper.likeComment({ id: 'comment-like-123', commentId: 'comment-123', owner: 'user-123' })
      await CommentLikesTableTestHelper.likeComment({ id: 'comment-like-456', commentId: 'comment-123', owner: 'user-456' })

      const likes = await commentLikeRepositoryPostgres.getCommentLikesByThreadId('thread-123')

      expect(likes).toHaveLength(2)
    })
  })

  describe('unlikeComment function', () => {
    it('should persist unlike comment and return correctly', async () => {
      await CommentLikesTableTestHelper.likeComment({ commentId: 'comment-123', owner: 'user-123' })

      const unlikeComment = await commentLikeRepositoryPostgres.unlikeComment('comment-123', 'user-123')

      const isCommentLiked = await CommentLikesTableTestHelper.isCommentLiked({ commentId: 'comment-123', owner: 'user-123' })
      expect(unlikeComment).toEqual(1)
      expect(isCommentLiked).toBeFalsy()
    })
  })
})

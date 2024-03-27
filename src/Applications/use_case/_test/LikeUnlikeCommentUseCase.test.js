const LikeUnlikeCommentUseCase = require('../LikeUnlikeCommentUseCase')
const CommentRepository = require('../../../Domains/comments/CommentRepository')
const ThreadRepository = require('../../../Domains/threads/ThreadRepository')
const CommentLikeRepository = require('../../../Domains/comment_likes/CommentLikeRepository')

describe('LikeUnlikeCommentUseCase', () => {
  it('should orchestrating the like comment action correctly', async () => {
    const payload = {
      commentId: 'comment-123',
      threadId: 'thread-123',
      owner: 'user-123'
    }

    const mockThreadRepository = new ThreadRepository()
    const mockCommentRepository = new CommentRepository()
    const mockCommentLikeRepository = new CommentLikeRepository()

    mockThreadRepository.verifyThreadAvailability = jest.fn().mockImplementation(() => Promise.resolve(1))
    mockCommentRepository.verifyCommentAvailability = jest.fn().mockImplementation(() => Promise.resolve(1))
    mockCommentLikeRepository.isCommentAlreadyLiked = jest.fn().mockImplementation(() => Promise.resolve(0))
    mockCommentLikeRepository.likeComment = jest.fn().mockImplementation(() => Promise.resolve(1))

    const likeUnlikeCommentUseCase = new LikeUnlikeCommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      commentLikeRepository: mockCommentLikeRepository
    })

    const result = await likeUnlikeCommentUseCase.execute(payload)

    expect(result).toEqual(1)
    expect(mockThreadRepository.verifyThreadAvailability).toBeCalledWith(payload.threadId)
    expect(mockCommentRepository.verifyCommentAvailability).toBeCalledWith(payload.commentId, payload.threadId)
    expect(mockCommentLikeRepository.isCommentAlreadyLiked).toBeCalledWith(payload.commentId, payload.owner)
    expect(mockCommentLikeRepository.likeComment).toBeCalledWith(payload.commentId, payload.owner)
  })

  it('should orchestrating the unlike comment action correctly', async () => {
    const payload = {
      commentId: 'comment-123',
      threadId: 'thread-123',
      owner: 'user-123'
    }

    const mockThreadRepository = new ThreadRepository()
    const mockCommentRepository = new CommentRepository()
    const mockCommentLikeRepository = new CommentLikeRepository()

    mockThreadRepository.verifyThreadAvailability = jest.fn().mockImplementation(() => Promise.resolve(1))
    mockCommentRepository.verifyCommentAvailability = jest.fn().mockImplementation(() => Promise.resolve(1))
    mockCommentLikeRepository.isCommentAlreadyLiked = jest.fn().mockImplementation(() => Promise.resolve(1))
    mockCommentLikeRepository.unlikeComment = jest.fn().mockImplementation(() => Promise.resolve(1))

    const likeUnlikeCommentUseCase = new LikeUnlikeCommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      commentLikeRepository: mockCommentLikeRepository
    })

    const result = await likeUnlikeCommentUseCase.execute(payload)

    expect(result).toEqual(1)
    expect(mockThreadRepository.verifyThreadAvailability).toBeCalledWith(payload.threadId)
    expect(mockCommentRepository.verifyCommentAvailability).toBeCalledWith(payload.commentId, payload.threadId)
    expect(mockCommentLikeRepository.isCommentAlreadyLiked).toBeCalledWith(payload.commentId, payload.owner)
    expect(mockCommentLikeRepository.unlikeComment).toBeCalledWith(payload.commentId, payload.owner)
  })
})

const GetThreadUseCase = require('../GetThreadUseCase')

const ThreadRepository = require('../../../Domains/threads/ThreadRepository')
const CommentRepository = require('../../../Domains/comments/CommentRepository')
const ReplyRepository = require('../../../Domains/replies/ReplyRepository')
const CommentLikeRepository = require('../../../Domains/comment_likes/CommentLikeRepository')

describe('GetThreadUseCase', () => {
  it('should orchestrating the get thread action correctly', async () => {
    const threadId = 'thread-123'

    const expectedThread = {
      id: threadId,
      title: 'A Thread',
      body: 'A thread body',
      date: new Date('2024-03-21T20:52:57.040Z'),
      username: 'rizkiromadoni'
    }

    const expectedComments = [
      {
        id: 'comment-123',
        content: 'comment one',
        username: 'rizkiromadoni',
        date: new Date('2024-03-21T21:52:57.040Z')
      }
    ]

    const expectedReplies = [
      {
        id: 'reply-123',
        content: 'reply one',
        username: 'rizkiromadoni',
        date: new Date('2024-03-21T23:52:57.040Z')
      }
    ]

    const expectedCommentLikesCount = 0

    const expectedResult = {
      ...expectedThread,
      comments: [
        {
          ...expectedComments[0],
          likeCount: expectedCommentLikesCount,
          replies: expectedReplies
        }
      ]
    }

    const mockThreadRepository = new ThreadRepository()
    const mockCommentRepository = new CommentRepository()
    const mockReplyRepository = new ReplyRepository()
    const mockCommentLikeRepository = new CommentLikeRepository()

    mockThreadRepository.getThreadById = jest.fn().mockImplementation(() => Promise.resolve({
      id: threadId,
      title: 'A Thread',
      body: 'A thread body',
      date: new Date('2024-03-21T20:52:57.040Z'),
      username: 'rizkiromadoni'
    }))
    mockCommentRepository.getCommentsByThreadId = jest.fn().mockImplementation(() => Promise.resolve([{
      id: 'comment-123',
      content: 'comment one',
      thread_id: 'thread-123',
      owner: 'user-123',
      date: new Date('2024-03-21T21:52:57.040Z'),
      is_deleted: false,
      username: 'rizkiromadoni'
    }]))
    mockReplyRepository.getRepliesByThreadId = jest.fn().mockImplementation(() => Promise.resolve([{
      id: 'reply-123',
      content: 'reply one',
      comment_id: 'comment-123',
      owner: 'user-123',
      date: new Date('2024-03-21T23:52:57.040Z'),
      is_deleted: false,
      username: 'rizkiromadoni'
    }]))
    mockCommentLikeRepository.getCommentLikesByThreadId = jest.fn().mockImplementation(() => Promise.resolve([]))

    const getThreadUseCase = new GetThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
      commentLikeRepository: mockCommentLikeRepository
    })

    const result = await getThreadUseCase.execute(threadId)

    expect(result).toStrictEqual(expectedResult)
    expect(mockThreadRepository.getThreadById).toBeCalledWith(threadId)
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith(threadId)
    expect(mockReplyRepository.getRepliesByThreadId).toBeCalledWith(threadId)
    expect(mockCommentLikeRepository.getCommentLikesByThreadId).toBeCalledWith(threadId)
  })

  it('should not display deleted comments and replies', async () => {
    const threadId = 'thread-123'

    const expectedThread = {
      id: threadId,
      title: 'A Thread',
      body: 'A thread body',
      date: new Date('2024-03-21T20:52:57.040Z'),
      username: 'rizkiromadoni'
    }

    const expectedComments = [
      {
        id: 'comment-123',
        content: '**komentar telah dihapus**',
        username: 'rizkiromadoni',
        date: new Date('2024-03-21T21:52:57.040Z')
      }
    ]

    const expectedReplies = [
      {
        id: 'reply-123',
        content: '**balasan telah dihapus**',
        username: 'rizkiromadoni',
        date: new Date('2024-03-21T23:52:57.040Z')
      }
    ]

    const expectedCommentLikesCount = 0

    const expectedResult = {
      ...expectedThread,
      comments: [
        {
          ...expectedComments[0],
          likeCount: expectedCommentLikesCount,
          replies: expectedReplies
        }
      ]
    }

    const mockThreadRepository = new ThreadRepository()
    const mockCommentRepository = new CommentRepository()
    const mockReplyRepository = new ReplyRepository()
    const mockCommentLikeRepository = new CommentLikeRepository()

    mockThreadRepository.getThreadById = jest.fn().mockImplementation(() => Promise.resolve({
      id: threadId,
      title: 'A Thread',
      body: 'A thread body',
      date: new Date('2024-03-21T20:52:57.040Z'),
      username: 'rizkiromadoni'
    }))
    mockCommentRepository.getCommentsByThreadId = jest.fn().mockImplementation(() => Promise.resolve([{
      id: 'comment-123',
      content: 'comment one',
      thread_id: 'thread-123',
      owner: 'user-123',
      date: new Date('2024-03-21T21:52:57.040Z'),
      is_deleted: true,
      username: 'rizkiromadoni'
    }]))
    mockReplyRepository.getRepliesByThreadId = jest.fn().mockImplementation(() => Promise.resolve([{
      id: 'reply-123',
      content: 'reply one',
      comment_id: 'comment-123',
      owner: 'user-123',
      date: new Date('2024-03-21T23:52:57.040Z'),
      is_deleted: true,
      username: 'rizkiromadoni'
    }]))
    mockCommentLikeRepository.getCommentLikesByThreadId = jest.fn().mockImplementation(() => Promise.resolve([]))

    const getThreadUseCase = new GetThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
      commentLikeRepository: mockCommentLikeRepository
    })

    const result = await getThreadUseCase.execute(threadId)

    expect(result).toStrictEqual(expectedResult)
    expect(mockThreadRepository.getThreadById).toBeCalledWith(threadId)
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith(threadId)
    expect(mockReplyRepository.getRepliesByThreadId).toBeCalledWith(threadId)
    expect(mockCommentLikeRepository.getCommentLikesByThreadId).toBeCalledWith(threadId)
  })

  it('should display comment likes count correctly', async () => {
    const threadId = 'thread-123'

    const expectedThread = {
      id: threadId,
      title: 'A Thread',
      body: 'A thread body',
      date: new Date('2024-03-21T20:52:57.040Z'),
      username: 'rizkiromadoni'
    }

    const expectedComments = [
      {
        id: 'comment-123',
        content: '**komentar telah dihapus**',
        username: 'rizkiromadoni',
        date: new Date('2024-03-21T21:52:57.040Z')
      }
    ]

    const expectedReplies = []

    const expectedCommentLikesCount = 2

    const expectedResult = {
      ...expectedThread,
      comments: [
        {
          ...expectedComments[0],
          likeCount: expectedCommentLikesCount,
          replies: expectedReplies
        }
      ]
    }

    const mockThreadRepository = new ThreadRepository()
    const mockCommentRepository = new CommentRepository()
    const mockReplyRepository = new ReplyRepository()
    const mockCommentLikeRepository = new CommentLikeRepository()

    mockThreadRepository.getThreadById = jest.fn().mockImplementation(() => Promise.resolve({
      id: threadId,
      title: 'A Thread',
      body: 'A thread body',
      date: new Date('2024-03-21T20:52:57.040Z'),
      username: 'rizkiromadoni'
    }))
    mockCommentRepository.getCommentsByThreadId = jest.fn().mockImplementation(() => Promise.resolve([{
      id: 'comment-123',
      content: 'comment one',
      thread_id: 'thread-123',
      owner: 'user-123',
      date: new Date('2024-03-21T21:52:57.040Z'),
      is_deleted: true,
      username: 'rizkiromadoni'
    }]))
    mockReplyRepository.getRepliesByThreadId = jest.fn().mockImplementation(() => Promise.resolve([]))
    mockCommentLikeRepository.getCommentLikesByThreadId = jest.fn().mockImplementation(() => Promise.resolve([
      { id: 'comment-like-123', comment_id: 'comment-123' },
      { id: 'comment-like-234', comment_id: 'comment-123' }
    ]))

    const getThreadUseCase = new GetThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
      commentLikeRepository: mockCommentLikeRepository
    })

    const result = await getThreadUseCase.execute(threadId)

    expect(result).toStrictEqual(expectedResult)
    expect(mockThreadRepository.getThreadById).toBeCalledWith(threadId)
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith(threadId)
    expect(mockReplyRepository.getRepliesByThreadId).toBeCalledWith(threadId)
    expect(mockCommentLikeRepository.getCommentLikesByThreadId).toBeCalledWith(threadId)
  })
})

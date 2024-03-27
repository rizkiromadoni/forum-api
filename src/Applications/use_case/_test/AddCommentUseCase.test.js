const AddComment = require('../../../Domains/comments/entities/AddComment')
const AddedComment = require('../../../Domains/comments/entities/AddedComment')
const CommentRepository = require('../../../Domains/comments/CommentRepository')
const ThreadRepository = require('../../../Domains/threads/ThreadRepository')
const AddCommentUseCase = require('../AddCommentUseCase')

describe('AddCommentUseCase', () => {
  it('should orchestrating the add comment action correctly', async () => {
    const payload = {
      threadId: 'thread-123',
      content: 'a comment',
      owner: 'user-123'
    }

    const expectedAddedComment = new AddedComment({
      id: 'comment-123',
      content: payload.content,
      owner: payload.owner
    })

    const mockCommentRepository = new CommentRepository()
    const mockThreadRepository = new ThreadRepository()

    mockThreadRepository.verifyThreadAvailability = jest.fn().mockImplementation(() => Promise.resolve(1))
    mockCommentRepository.addComment = jest.fn().mockImplementation(() => Promise.resolve(new AddedComment({
      id: 'comment-123',
      content: payload.content,
      owner: payload.owner
    })))

    const addCommentUseCase = new AddCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository
    })

    const addedComment = await addCommentUseCase.execute(payload)

    expect(addedComment).toStrictEqual(expectedAddedComment)
    expect(mockThreadRepository.verifyThreadAvailability).toBeCalledWith(payload.threadId)
    expect(mockCommentRepository.addComment).toBeCalledWith(new AddComment(payload))
  })
})

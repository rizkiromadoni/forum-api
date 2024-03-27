const CommentRepository = require('../../../Domains/comments/CommentRepository')
const DeleteCommentUseCase = require('../DeleteCommentUseCase')

describe('DeleteCommentUseCase', () => {
  it('should orchestrating the delete comment action correctly', async () => {
    const payload = {
      commentId: 'comment-123',
      threadId: 'thread-123',
      owner: 'user-123'
    }

    const mockCommentRepository = new CommentRepository()

    mockCommentRepository.verifyCommentAvailability = jest.fn().mockImplementation(() => Promise.resolve(1))
    mockCommentRepository.verifyCommentOwner = jest.fn().mockImplementation(() => Promise.resolve(1))
    mockCommentRepository.deleteCommentById = jest.fn().mockImplementation(() => Promise.resolve(1))

    const deleteCommentUseCase = new DeleteCommentUseCase({ commentRepository: mockCommentRepository })

    await deleteCommentUseCase.execute(payload)

    expect(mockCommentRepository.verifyCommentAvailability).toBeCalledWith(payload.commentId, payload.threadId)
    expect(mockCommentRepository.verifyCommentOwner).toBeCalledWith(payload.commentId, payload.owner)
    expect(mockCommentRepository.deleteCommentById).toBeCalledWith(payload.commentId)
  })
})

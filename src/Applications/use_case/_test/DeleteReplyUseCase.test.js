const ReplyRepository = require('../../../Domains/replies/ReplyRepository')
const DeleteReplyUseCase = require('../DeleteReplyUseCase')

describe('DeleteReplyUseCase', () => {
  it('should orchestrating the delete reply action correctly', async () => {
    const payload = {
      replyId: 'reply-123',
      commentId: 'comment-123',
      threadId: 'thread-123',
      owner: 'user-123'
    }

    const mockReplyRepository = new ReplyRepository()

    mockReplyRepository.verifyReplyAvailability = jest.fn().mockImplementation(() => Promise.resolve(1))
    mockReplyRepository.verifyReplyOwner = jest.fn().mockImplementation(() => Promise.resolve(1))
    mockReplyRepository.deleteReplyById = jest.fn().mockImplementation(() => Promise.resolve(1))

    const deleteReplyUseCase = new DeleteReplyUseCase({ replyRepository: mockReplyRepository })

    await deleteReplyUseCase.execute(payload)

    expect(mockReplyRepository.verifyReplyAvailability).toBeCalledWith(payload.replyId, payload.commentId, payload.threadId)
    expect(mockReplyRepository.verifyReplyOwner).toBeCalledWith(payload.replyId, payload.owner)
    expect(mockReplyRepository.deleteReplyById).toBeCalledWith(payload.replyId)
  })
})

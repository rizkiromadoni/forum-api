const AddReply = require('../../../Domains/replies/entities/AddReply')
const AddedReply = require('../../../Domains/replies/entities/AddedReply')
const ThreadRepository = require('../../../Domains/threads/ThreadRepository')
const CommentRepository = require('../../../Domains/comments/CommentRepository')
const ReplyRepository = require('../../../Domains/replies/ReplyRepository')
const AddReplyUseCase = require('../AddReplyUseCase')

describe('AddReplyUseCase', () => {
  it('should orchestrating the add reply action correctly', async () => {
    const payload = {
      commentId: 'comment-123',
      content: 'a reply',
      owner: 'user-123'
    }

    const expectedAddedReply = new AddedReply({
      id: 'reply-123',
      content: payload.content,
      owner: payload.owner
    })

    const mockThreadRepository = new ThreadRepository()
    const mockCommentRepository = new CommentRepository()
    const mockReplyRepository = new ReplyRepository()

    mockThreadRepository.verifyThreadAvailability = jest.fn().mockImplementation(() => Promise.resolve(1))
    mockCommentRepository.verifyCommentAvailability = jest.fn().mockImplementation(() => Promise.resolve(1))
    mockReplyRepository.addReply = jest.fn().mockImplementation(() => Promise.resolve(new AddedReply({
      id: 'reply-123',
      content: payload.content,
      owner: payload.owner
    })))

    const addReplyUseCase = new AddReplyUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository
    })

    const addedReply = await addReplyUseCase.execute(payload)

    expect(addedReply).toStrictEqual(expectedAddedReply)
    expect(mockThreadRepository.verifyThreadAvailability).toBeCalledWith(payload.threadId)
    expect(mockCommentRepository.verifyCommentAvailability).toBeCalledWith(payload.commentId, payload.threadId)
    expect(mockReplyRepository.addReply).toBeCalledWith(new AddReply(payload))
  })
})

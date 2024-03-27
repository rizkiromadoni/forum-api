const AddReply = require('../AddReply')

describe('AddReply entities', () => {
  it('should throw error when payload not contain needed property', () => {
    const payload = {
      commentId: 'comment-123'
    }

    expect(() => new AddReply(payload)).toThrowError(
      'ADD_REPLY.NOT_CONTAIN_NEEDED_PROPERTY'
    )
  })

  it('should throw error when payload not meet data type specification', () => {
    const payload = {
      commentId: 123,
      content: 'content reply',
      owner: 'user-123'
    }

    expect(() => new AddReply(payload)).toThrowError(
      'ADD_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION'
    )
  })

  it('should create AddReply entities correctly', () => {
    const payload = {
      commentId: 'comment-123',
      content: 'content reply',
      owner: 'user-123'
    }

    const addReply = new AddReply(payload)
    expect(addReply).toEqual(payload)
  })
})

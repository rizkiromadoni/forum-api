const AddedReply = require('../AddedReply')

describe('AddedReply entities', () => {
  it('should throw error when payload not contain needed property', () => {
    const payload = {
      id: 'reply-123'
    }

    expect(() => new AddedReply(payload)).toThrowError(
      'ADDED_REPLY.NOT_CONTAIN_NEEDED_PROPERTY'
    )
  })

  it('should throw error when payload not meet data type specification', () => {
    const payload = {
      id: 123,
      content: 'content reply',
      owner: 'user-123'
    }

    expect(() => new AddedReply(payload)).toThrowError(
      'ADDED_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION'
    )
  })

  it('should create AddedReply entities correctly', () => {
    const payload = {
      id: 'reply-123',
      content: 'content reply',
      owner: 'user-123'
    }

    const addedReply = new AddedReply(payload)
    expect(addedReply).toEqual(payload)
  })
})

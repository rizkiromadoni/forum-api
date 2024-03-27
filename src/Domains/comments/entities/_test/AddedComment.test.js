const AddedComment = require('../AddedComment')

describe('a AddedComment entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = {
      content: 'any comment'
    }

    expect(() => new AddedComment(payload)).toThrowError(
      'ADDED_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY'
    )
  })

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      id: 'comment-123',
      content: 1234,
      owner: 5678
    }

    expect(() => new AddedComment(payload)).toThrowError(
      'ADDED_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION'
    )
  })

  it('should create AddedComment object correctly', () => {
    const payload = {
      id: 'comment-123',
      content: 'any comment',
      owner: 'user-123'
    }

    const { id, content, owner } = new AddedComment(payload)

    expect(id).toEqual(payload.id)
    expect(content).toEqual(payload.content)
    expect(owner).toEqual(payload.owner)
  })
})

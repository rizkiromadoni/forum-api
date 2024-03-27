const AddThread = require('../AddThread')

describe('AddThread entities', () => {
  it('should throw error when payload not contain needed property', () => {
    const payload = {
      title: 'A Thread',
      body: 'some thread content'
    }

    expect(() => new AddThread(payload)).toThrowError(
      'ADD_THREAD.NOT_CONTAIN_NEEDED_PROPERTY'
    )
  })

  it('should throw error when payload not meet data type specification', () => {
    const payload = {
      title: 'A Thread',
      body: 123,
      owner: 456
    }

    expect(() => new AddThread(payload)).toThrowError(
      'ADD_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION'
    )
  })

  it('should create AddThread entities correctly', () => {
    const payload = {
      title: 'title',
      body: 'body',
      owner: 'user-123'
    }

    const newThread = new AddThread(payload)

    expect(newThread).toBeInstanceOf(AddThread)
    expect(newThread.title).toEqual(payload.title)
    expect(newThread.body).toEqual(payload.body)
    expect(newThread.owner).toEqual(payload.owner)
  })
})

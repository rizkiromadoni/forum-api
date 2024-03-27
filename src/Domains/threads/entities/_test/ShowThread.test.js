const ShowThread = require('../ShowThread')

describe('ShowThread entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = {
      title: 'A Thread'
    }

    expect(() => new ShowThread(payload)).toThrowError('SHOW_THREAD.NOT_CONTAIN_NEEDED_PROPERTY')
  })

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      id: 123,
      title: 456,
      body: 'a thread body',
      date: '20222021-08-08T07:19:09.775Z',
      username: 'user-123'
    }

    expect(() => new ShowThread(payload)).toThrowError('SHOW_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION')
  })

  it('should create DetailThread entities correctly', () => {
    const payload = {
      id: 'thread-123',
      title: 'A Thread',
      body: 'a thread body',
      date: '2021-08-08T07:19:09.775Z',
      username: 'user-123'
    }

    const result = new ShowThread(payload)

    expect(result.id).toEqual(payload.id)
    expect(result.title).toEqual(payload.title)
    expect(result.body).toEqual(payload.body)
    expect(result.date).toEqual(payload.date)
    expect(result.username).toEqual(payload.username)
  })
})

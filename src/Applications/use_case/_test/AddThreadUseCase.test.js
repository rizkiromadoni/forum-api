const AddedThread = require('../../../Domains/threads/entities/AddedThread')
const AddThread = require('../../../Domains/threads/entities/AddThread')
const ThreadRepository = require('../../../Domains/threads/ThreadRepository')
const AddThreadUseCase = require('../AddThreadUseCase')

describe('AddThreadUseCase', () => {
  it('should orchestrating the add thread action correctly', async () => {
    const payload = {
      title: 'A Thread',
      body: 'A thread body',
      owner: 'user-123'
    }

    const expectedAddedThread = new AddedThread({
      id: 'thread-123',
      title: payload.title,
      owner: payload.owner
    })

    const mockThreadRepository = new ThreadRepository()
    mockThreadRepository.addThread = jest.fn().mockImplementation(() => Promise.resolve(new AddedThread({
      id: 'thread-123',
      title: payload.title,
      owner: payload.owner
    })))

    const addThreadUseCase = new AddThreadUseCase({ threadRepository: mockThreadRepository })

    const addedThread = await addThreadUseCase.execute(payload)

    expect(addedThread).toStrictEqual(expectedAddedThread)
    expect(mockThreadRepository.addThread).toBeCalledWith(new AddThread(payload))
  })
})

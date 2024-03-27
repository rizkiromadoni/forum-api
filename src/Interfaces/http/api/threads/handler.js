const AddThreadUseCase = require('../../../../Applications/use_case/AddThreadUseCase')
const GetThreadUseCase = require('../../../../Applications/use_case/GetThreadUseCase')

class ThreadHandler {
  constructor (container) {
    this._container = container

    this.getThreadByIdHandler = this.getThreadByIdHandler.bind(this)
    this.postThreadHandler = this.postThreadHandler.bind(this)
  }

  async getThreadByIdHandler (request, h) {
    const { threadId } = request.params

    const getThreadUseCase = this._container.getInstance(GetThreadUseCase.name)
    const thread = await getThreadUseCase.execute(threadId)

    return {
      status: 'success',
      data: {
        thread
      }
    }
  }

  async postThreadHandler (request, h) {
    const { title, body } = request.payload
    const { id: userId } = request.auth.credentials

    const payload = {
      title,
      body,
      owner: userId
    }

    const addThreadUseCase = this._container.getInstance(AddThreadUseCase.name)
    const addedThread = await addThreadUseCase.execute(payload)

    const response = h.response({
      status: 'success',
      message: 'Thread berhasil ditambahkan',
      data: {
        addedThread
      }
    })
    response.code(201)
    return response
  }
}

module.exports = ThreadHandler

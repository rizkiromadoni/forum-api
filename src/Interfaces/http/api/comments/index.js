const routes = require('./routes')
const CommentHandler = require('./handler')

module.exports = {
  name: 'comments',
  version: '1.0.0',
  register: async (server, { container }) => {
    const commentsHandler = new CommentHandler(container)
    server.route(routes(commentsHandler))
  }
}

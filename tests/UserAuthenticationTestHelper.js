/* istanbul ignore file */
const UserAuthenticationTestHelper = {
  async generateUserAuthentication (server) {
    const responseUser = await server.inject({
      method: 'POST',
      url: '/users',
      payload: {
        username: 'rizkiromadoni',
        password: 'secret',
        fullname: 'R Sahro Romadoni'
      }
    })

    const responseAuth = await server.inject({
      method: 'POST',
      url: '/authentications',
      payload: {
        username: 'rizkiromadoni',
        password: 'secret'
      }
    })

    return {
      userId: JSON.parse(responseUser.payload).data.addedUser.id,
      accessToken: JSON.parse(responseAuth.payload).data.accessToken
    }
  }
}

module.exports = UserAuthenticationTestHelper

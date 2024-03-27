const CommentLikeRepository = require('../CommentLikeRepository')

describe('CommentLikeRepository interface', () => {
  it('should throw error when invoke abstract behavior', async () => {
    const commentLikeRepository = new CommentLikeRepository()

    await expect(commentLikeRepository.likeComment('', '')).rejects.toThrowError(
      'LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED'
    )
    await expect(commentLikeRepository.isCommentAlreadyLiked('', '')).rejects.toThrowError(
      'LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED'
    )
    await expect(commentLikeRepository.unlikeComment('', '')).rejects.toThrowError(
      'LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED'
    )
    await expect(commentLikeRepository.getCommentLikesByThreadId('')).rejects.toThrowError(
      'LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED'
    )
  })
})

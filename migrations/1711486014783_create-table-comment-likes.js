/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.createTable('comment_likes', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true
    },
    comment_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: 'comments',
      onDelete: 'cascade'
    },
    owner: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: 'users',
      onDelete: 'cascade'
    }
  })

  pgm.createIndex('comment_likes', 'comment_id')
  pgm.createIndex('comment_likes', 'owner')
}

exports.down = (pgm) => {
  pgm.dropTable('comment_likes')
}

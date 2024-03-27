/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.createTable('replies', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true
    },
    content: {
      type: 'TEXT',
      notNull: true
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
    },
    date: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp')
    },
    is_deleted: {
      type: 'BOOLEAN',
      notNull: true,
      default: false
    }
  })

  pgm.createIndex('replies', 'comment_id')
  pgm.createIndex('replies', 'owner')
}

exports.down = (pgm) => {
  pgm.dropTable('replies')
}

const Model = require('../config/objection');

class Transaction extends Model {
  static get tableName() {
    return 'transactions';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['user_id', 'type', 'category', 'amount', 'date'],
      properties: {
        id:       { type: 'integer' },
        user_id:  { type: 'integer' },
        type:     { type: 'string', enum: ['income', 'expense'] },
        category: { type: 'string' },
        amount:   { type: 'number', minimum: 0.01 },
        date:     { type: 'string', format: 'date' },
        note:     { type: ['string', 'null'] },
      },
    };
  }
}

module.exports = Transaction;

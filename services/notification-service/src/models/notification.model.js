const Model = require("../config/objection");

class Notification extends Model {
  static get tableName() {
    return "notifications";
  }

  static get idColumn() {
    return "id";
  }

  static get jsonAttributes() {
    return ["data", "channels"];
  }
}

module.exports = Notification;

const Model = require("../config/objection");

class User extends Model {
    static get tableName() {
        return "users";
    }

    static get idColumn() {
        return "id";
    }

    static get jsonSchema() {
        return {
            type: "object",
            required: ["fullname", "email", "password"],
            properties: {
                id: { type: "integer" },
                fullname: { type: "string", minLength: 1, maxLength: 255 },
                email: { type: "string", format: "email" },
                password: { type: "string" },
                role: { type: "string", default: "user" },
                refresh_token: { type: ["string", "null"] },
                created_at: { type: ["string", "null"], format: "date-time" },
                updated_at: { type: ["string", "null"], format: "date-time" },
            },
        };
    }
}

module.exports = User;

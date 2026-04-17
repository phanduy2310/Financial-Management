require("dotenv").config({ path: ".env.dev" });
const jwt = require("jsonwebtoken");

const token = jwt.sign(
    { id: 1, email: "test@example.com", role: "user", fullname: "Test User" },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
);

console.log("Token for user 1:");
console.log(token);
//token_test=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIiwicm9sZSI6InVzZXIiLCJmdWxsbmFtZSI6IlRlc3QgVXNlciIsImlhdCI6MTc3NjM2MzcxMSwiZXhwIjoxNzc2OTY4NTExfQ.86g_MwIeSUPxnA_x8aEyXzeObKBCC3rIlqPEhc-iXHc
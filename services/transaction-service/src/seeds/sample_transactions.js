/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
    await knex("transactions").del();

    await knex("transactions").insert([
        // User 1 - Tháng 4/2026
        { user_id: 1, type: "income",  category: "Lương",       amount: 15000000, date: "2026-04-01", note: "Lương tháng 4" },
        { user_id: 1, type: "expense", category: "Ăn uống",     amount: 150000,   date: "2026-04-02", note: "Cơm trưa" },
        { user_id: 1, type: "expense", category: "Di chuyển",   amount: 50000,    date: "2026-04-03", note: "Xăng xe" },
        { user_id: 1, type: "expense", category: "Ăn uống",     amount: 200000,   date: "2026-04-05", note: "Ăn tối với bạn" },
        { user_id: 1, type: "expense", category: "Mua sắm",     amount: 500000,   date: "2026-04-07", note: "Quần áo" },
        { user_id: 1, type: "income",  category: "Freelance",   amount: 3000000,  date: "2026-04-10", note: "Dự án web" },
        { user_id: 1, type: "expense", category: "Hóa đơn",     amount: 300000,   date: "2026-04-15", note: "Tiền điện" },
        { user_id: 1, type: "expense", category: "Giải trí",    amount: 120000,   date: "2026-04-18", note: "Xem phim" },
        { user_id: 1, type: "expense", category: "Ăn uống",     amount: 80000,    date: "2026-04-20", note: "Cà phê" },
        { user_id: 1, type: "expense", category: "Học tập",     amount: 500000,   date: "2026-04-22", note: "Khóa học online" },

        // User 1 - Tháng 3/2026
        { user_id: 1, type: "income",  category: "Lương",       amount: 15000000, date: "2026-03-01", note: "Lương tháng 3" },
        { user_id: 1, type: "expense", category: "Ăn uống",     amount: 2000000,  date: "2026-03-10", note: "Chi tiêu ăn uống tháng 3" },
        { user_id: 1, type: "expense", category: "Di chuyển",   amount: 400000,   date: "2026-03-15", note: "Xăng xe tháng 3" },
        { user_id: 1, type: "expense", category: "Hóa đơn",     amount: 600000,   date: "2026-03-20", note: "Tiền điện nước" },

        // User 2 - Tháng 4/2026
        { user_id: 2, type: "income",  category: "Lương",       amount: 12000000, date: "2026-04-01", note: "Lương tháng 4" },
        { user_id: 2, type: "expense", category: "Ăn uống",     amount: 100000,   date: "2026-04-03", note: "Bữa sáng" },
        { user_id: 2, type: "expense", category: "Mua sắm",     amount: 800000,   date: "2026-04-08", note: "Đồ dùng gia đình" },
    ]);
};

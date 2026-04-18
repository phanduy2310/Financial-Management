/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
    await knex("group_transaction_shares").del();
    await knex("group_transactions").del();
    await knex("group_members").del();
    await knex("groups").del();

    await knex("groups").insert([
        { id: 1, name: "Nhóm du lịch Đà Lạt", description: "Chi phí chuyến đi Đà Lạt tháng 4", owner_id: 1 },
        { id: 2, name: "Nhóm ăn trưa văn phòng", description: "Quản lý tiền ăn trưa hàng ngày", owner_id: 1 },
    ]);

    await knex("group_members").insert([
        { group_id: 1, user_id: 1, role: "owner" },
        { group_id: 1, user_id: 2, role: "member" },
        { group_id: 1, user_id: 3, role: "member" },
        { group_id: 2, user_id: 1, role: "owner" },
        { group_id: 2, user_id: 2, role: "member" },
    ]);

    await knex("group_transactions").insert([
        { id: 1, group_id: 1, user_id: 1, type: "expense", category: "Ăn uống",   amount: 600000,  date: "2026-04-10", note: "Bữa tối ngày 1" },
        { id: 2, group_id: 1, user_id: 2, type: "expense", category: "Di chuyển", amount: 300000,  date: "2026-04-11", note: "Xe từ sân bay" },
        { id: 3, group_id: 1, user_id: 1, type: "expense", category: "Khách sạn", amount: 1500000, date: "2026-04-11", note: "2 đêm khách sạn" },
        { id: 4, group_id: 1, user_id: 3, type: "income",  category: "Quỹ nhóm",  amount: 1000000, date: "2026-04-09", note: "Đóng quỹ chuyến đi" },
        { id: 5, group_id: 2, user_id: 1, type: "expense", category: "Ăn uống",   amount: 150000,  date: "2026-04-14", note: "Cơm trưa thứ 2" },
        { id: 6, group_id: 2, user_id: 2, type: "expense", category: "Ăn uống",   amount: 120000,  date: "2026-04-15", note: "Cơm trưa thứ 3" },
    ]);

    await knex("group_transaction_shares").insert([
        { transaction_id: 1, user_id: 1, amount: 200000 },
        { transaction_id: 1, user_id: 2, amount: 200000 },
        { transaction_id: 1, user_id: 3, amount: 200000 },
        { transaction_id: 3, user_id: 1, amount: 500000 },
        { transaction_id: 3, user_id: 2, amount: 500000 },
        { transaction_id: 3, user_id: 3, amount: 500000 },
    ]);
};

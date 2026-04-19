import React, { useEffect, useState, useCallback } from "react";
import { Users, Plus, LayoutGrid } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "../../api/axios";
import AddGroupModal from "../../components/group/AddGroupModal";
import GroupCard from "../../components/group/GroupCard";
import { useUserId } from "../../hooks/useUserId";
import { motion, AnimatePresence } from "framer-motion";

export default function GroupList() {
    const [groups, setGroups] = useState([]);
    const [openModal, setOpenModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const userId = useUserId();

    const fetchGroups = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axios.get(`/groups/user/${userId}`);
            setGroups(res.data.data || res.data);
        } catch (err) {
            console.error("Load groups error:", err);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        if (userId) fetchGroups();
    }, [fetchGroups]);

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 min-h-screen">
            {/* HEADER SECTION */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-4">
                        <div className="p-3 bg-red-700 text-white rounded-[1.25rem] shadow-lg shadow-red-700/20">
                            <Users size={32} strokeWidth={2.5} />
                        </div>
                        NHÓM CHI TIÊU
                    </h1>
                    <p className="text-slate-400 font-bold text-sm mt-2 uppercase tracking-widest">
                        Quản lý ngân sách chung cùng bạn bè và gia đình
                    </p>
                </motion.div>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setOpenModal(true)}
                    className="flex items-center gap-3 bg-red-900 hover:bg-red-700 text-white font-black text-xs uppercase tracking-[0.15em] px-8 py-4 rounded-2xl shadow-xl shadow-slate-900/10 transition-all"
                >
                    <Plus size={20} strokeWidth={3} /> Tạo nhóm mới
                </motion.button>
            </div>

            {/* MAIN CONTENT */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="h-64 bg-slate-100 rounded-[2.5rem] animate-pulse"
                        />
                    ))}
                </div>
            ) : groups.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-[3rem] border-2 border-dashed border-slate-200 p-20 text-center"
                >
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-slate-50 text-slate-300 rounded-full mb-6">
                        <LayoutGrid size={48} />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tight">
                        Chưa có không gian chung
                    </h3>
                    <p className="text-slate-400 font-medium mb-8 max-w-sm mx-auto">
                        Bắt đầu chia sẻ hóa đơn và theo dõi nợ nần bằng cách tạo
                        nhóm đầu tiên của bạn.
                    </p>
                    <button
                        onClick={() => setOpenModal(true)}
                        className="bg-red-50 text-red-700 font-black text-xs uppercase tracking-widest px-8 py-4 rounded-2xl hover:bg-red-700 hover:text-white transition-all"
                    >
                        Khởi tạo ngay
                    </button>
                </motion.div>
            ) : (
                <motion.div
                    layout
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                    <AnimatePresence>
                        {groups.map((g, index) => (
                            <motion.div
                                key={g.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <GroupCard
                                    group={g}
                                    onClick={() =>
                                        navigate(`/app/groups/${g.id}`, {
                                            state: { group: g },
                                        })
                                    }
                                />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>
            )}

            {openModal && (
                <AddGroupModal
                    onClose={() => setOpenModal(false)}
                    refresh={fetchGroups}
                />
            )}
        </div>
    );
}

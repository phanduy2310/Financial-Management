import { useEffect, useState } from "react";
import axios from "../../api/axios";
import { Link } from "react-router-dom";

import AddChildModal from "./AddChildModal";

export default function ChildrenList() {
    const [children, setChildren] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openAdd, setOpenAdd] = useState(false);

    useEffect(() => {
        const fetchChildren = async () => {
            try {
                const res = await axios.get("/parent/children");
                setChildren(res.data.data || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchChildren();
    }, []);

    if (loading) {
        return <p>Đang tải danh sách con...</p>;
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Danh sách con</h1>

                <button
                    onClick={() => setOpenAdd(true)}
                    className="px-4 py-2 rounded-lg bg-primary-700 text-white text-sm"
                >
                    + Thêm con
                </button>
            </div>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="text-left p-4">Email</th>
                            <th className="text-left p-4">Ngày liên kết</th>
                            <th className="text-right p-4"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {children.length === 0 && (
                            <tr>
                                <td
                                    colSpan="3"
                                    className="p-4 text-center text-gray-500"
                                >
                                    Chưa có con nào được liên kết
                                </td>
                            </tr>
                        )}

                        {children.map((item) => (
                            <tr
                                key={item.id}
                                className="border-b hover:bg-gray-50"
                            >
                                <td className="p-4">{item.child?.email}</td>
                                <td className="p-4">
                                    {new Date(
                                        item.accepted_at
                                    ).toLocaleDateString("vi-VN")}
                                </td>
                                <td className="p-4 text-right">
                                    <Link
                                        to={`/parent/children/${item.child_id}`}
                                        className="text-primary hover:underline"
                                    >
                                        Xem chi tiết →
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <AddChildModal
                open={openAdd}
                onClose={() => setOpenAdd(false)}
                onSuccess={() => {
                    setOpenAdd(false);
                    // reload list
                    setLoading(true);
                    axios.get("/parent/children").then((res) => {
                        setChildren(res.data.data || []);
                        setLoading(false);
                    });
                }}
            />
            
        </div>
    );
}

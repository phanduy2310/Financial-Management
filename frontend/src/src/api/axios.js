import axios from "axios";

const axiosInstance = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL || "http://localhost:5444/api",
    headers: { "Content-Type": "application/json" },
});

// ✅ GẮN TOKEN TỰ ĐỘNG
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("accessToken");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ✅ TỰ ĐỘNG REFRESH TOKEN KHI HẾT HẠN
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const original = error.config;
        if (error.response?.status === 401 && !original._retry) {
            original._retry = true;
            try {
                const res = await axios.post(
                    `${process.env.REACT_APP_API_BASE_URL || "http://localhost:5444/api"}/auth/refresh`,
                    {},
                    { withCredentials: true }
                );
                const newToken = res.data.data?.accessToken;
                if (newToken) {
                    localStorage.setItem("accessToken", newToken);
                    original.headers.Authorization = `Bearer ${newToken}`;
                    return axiosInstance(original);
                }
            } catch {
                localStorage.removeItem("accessToken");
                localStorage.removeItem("user");
                window.location.href = "/auth/login";
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;

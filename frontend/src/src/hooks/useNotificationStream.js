import { useEffect, useRef } from "react";

export default function useNotificationStream(onMessage) {
    // Dùng ref để tránh re-subscribe khi onMessage thay đổi reference
    const onMessageRef = useRef(onMessage);
    useEffect(() => {
        onMessageRef.current = onMessage;
    }, [onMessage]);

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        if (!token) return;

        let es;
        let retryTimeout;
        let closed = false;

        const connect = () => {
            if (closed) return;

            const gatewayUrl = process.env.REACT_APP_GATEWAY_URL || "http://localhost:5444";
            es = new EventSource(
                `${gatewayUrl}/api/notification/stream?token=${token}`
            );

            es.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    onMessageRef.current(data);
                } catch {
                    // ignore malformed events
                }
            };

            es.onerror = () => {
                es.close();
                if (!closed) {
                    // Retry sau 5 giây
                    retryTimeout = setTimeout(connect, 5000);
                }
            };
        };

        connect();

        return () => {
            closed = true;
            clearTimeout(retryTimeout);
            if (es) es.close();
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Chỉ chạy 1 lần khi mount
}

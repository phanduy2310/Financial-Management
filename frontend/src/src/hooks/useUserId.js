import { useMemo } from "react";
import { getUserId } from "../utils/auth";

/**
 * Custom hook to get the current user ID from JWT token
 * @returns {number|null} Current user ID or null if not authenticated
 */
export const useUserId = () => {
    const userId = useMemo(() => {
        return getUserId();
    }, []);

    return userId;
};


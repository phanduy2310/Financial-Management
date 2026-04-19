import { getToken } from "./storage";

const decodeBase64Utf8 = (str) => {
    const base64 = str.replace(/-/g, "+").replace(/_/g, "/");

    const bytes = Uint8Array.from(
        atob(base64)
            .split("")
            .map((c) => c.charCodeAt(0))
    );

    return new TextDecoder("utf-8").decode(bytes);
};

/**
 * Decode JWT token and extract user information
 * @returns {object|null} Decoded token payload or null if invalid
 */
export const decodeToken = () => {
    try {
        const token = getToken();
        if (!token) return null;

        // token gồm 3 phần header.payload.signature
        const parts = token.split(".");
        if (parts.length !== 3) return null;

        const payload = decodeBase64Utf8(parts[1]);
        return JSON.parse(payload);
    } catch (error) {
        console.error("Error decoding token:", error);
        return null;
    }
};

/**
 * Get user ID from JWT token
 * @returns {number|null} User ID or null if not found
 */
export const getUserId = () => {
    const decoded = decodeToken();
    if (!decoded) return null;

    // Try different possible field names for user ID
    return decoded.id || null;
};

/**
 * Get user name from JWT token
 * @returns {string|null} User name or null if not found
 */
export const getUserName = () => {
    const decoded = decodeToken();
    if (!decoded) return null;

    // Try different possible field names for user name
    return decoded.fullname || null;
};

/**
 * Get user phone from JWT token
 * @returns {string|null} User phone or null if not found
 */
export const getEmail = () => {
    const decoded = decodeToken();
    if (!decoded) return null;

    // Try different possible field names for user phone
    return decoded.email || null;
};

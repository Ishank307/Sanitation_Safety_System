export const API_URL = "http://localhost:3000/api";
export const API_ORIGIN = API_URL.replace(/\/api\/?$/, "");

const getHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const fetchApi = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        ...getHeaders(),
        ...options.headers,
      },
    });

    const data = await response.json();
    return { status: response.status, data };
  } catch (error) {
    console.error("API Fetch Error:", error);
    return { status: 500, data: { success: false, message: "Network Error" } };
  }
};

/** multipart/form-data (do not set Content-Type — browser sets boundary) */
export const fetchApiMultipart = async (endpoint, formData, method = "POST") => {
  try {
    const token = localStorage.getItem("token");
    const headers = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    const response = await fetch(`${API_URL}${endpoint}`, { method, body: formData, headers });
    const data = await response.json();
    return { status: response.status, data };
  } catch (error) {
    console.error("API Fetch Error:", error);
    return { status: 500, data: { success: false, message: "Network Error" } };
  }
};

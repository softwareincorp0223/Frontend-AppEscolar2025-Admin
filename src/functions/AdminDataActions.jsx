import axiosInstance from "../config/axiosInstance";

const API_PREFIX = "/api/";
const ADMIN_TOKEN_KEY = "adminToken";
const ADMIN_USER_KEY = "adminUser";

export const generateId = (length = 10) => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let id = "";
  for (let i = 0; i < length; i += 1) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
};

export const todayDateTime = () => new Date().toISOString();

export const formatDate = (value) => {
  if (!value) return "";
  return String(value).slice(0, 10);
};

export const addOneYear = (dateValue) => {
  if (!dateValue) return "";
  const date = new Date(`${dateValue}T00:00:00`);
  date.setFullYear(date.getFullYear() + 1);
  return date.toISOString().slice(0, 10);
};

export const generateQrCode = () => `QR-${generateId(16)}`;

export const getAdminToken = () => localStorage.getItem(ADMIN_TOKEN_KEY);

export const getAdminUser = () => {
  try {
    return JSON.parse(localStorage.getItem(ADMIN_USER_KEY) || "null");
  } catch {
    return null;
  }
};

export const clearAdminSession = () => {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  localStorage.removeItem(ADMIN_USER_KEY);
};

export const saveAdminSession = ({ token, usuario }) => {
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
  localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(usuario || {}));
};

const authHeaders = () => {
  const token = getAdminToken();

  return token ? { Authorization: `Bearer ${token}` } : {};
};

const parseError = (error) => {
  const data = error.response?.data;
  if (Array.isArray(data?.errors)) return data.errors.join("\n");
  if (Array.isArray(data?.detalles)) return data.detalles.join("\n");
  return data?.details || data?.error || data?.message || error.message;
};

export const apiGet = async (endpoint) => {
  try {
    const response = await axiosInstance.get(`${API_PREFIX}${endpoint}`, {
      headers: authHeaders(),
    });
    return response.data;
  } catch (error) {
    throw new Error(parseError(error));
  }
};

export const loginAdmin = async ({ correo, contrasena }) => {
  try {
    const response = await axiosInstance.post(`${API_PREFIX}auth/login`, {
      correo,
      contrasena,
      tipo: "admin",
    });

    saveAdminSession(response.data);
    return response.data;
  } catch (error) {
    throw new Error(parseError(error));
  }
};

export const apiPost = async (endpoint, payload) => {
  try {
    const response = await axiosInstance.post(`${API_PREFIX}${endpoint}`, payload, {
      headers: authHeaders(),
    });
    return response.data;
  } catch (error) {
    throw new Error(parseError(error));
  }
};

export const apiPut = async (endpoint, payload) => {
  try {
    const response = await axiosInstance.put(`${API_PREFIX}${endpoint}`, payload, {
      headers: authHeaders(),
    });
    return response.data;
  } catch (error) {
    throw new Error(parseError(error));
  }
};

export const apiDelete = async (endpoint) => {
  try {
    const response = await axiosInstance.delete(`${API_PREFIX}${endpoint}`, {
      headers: authHeaders(),
    });
    return response.data;
  } catch (error) {
    throw new Error(parseError(error));
  }
};

export const option = (value, label) => ({ value, label: label || value });

export const toOptions = (items, idKey, labelKey = "nombre") =>
  items.map((item) => option(item[idKey], item[labelKey]));

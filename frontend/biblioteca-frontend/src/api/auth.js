import axios from "axios";

const BASE_URL =
  process.env.REACT_APP_ENV === "local"
    ? process.env.REACT_APP_API_LOCAL
    : process.env.REACT_APP_API_REMOTE;

const AUTH_URL = `${BASE_URL}/auth`;

export const register = (email, password, role) => {
  return axios.post(`${AUTH_URL}/register`, { email, password, role });
};

export const login = (email, password) => {
  return axios.post(`${AUTH_URL}/login`, { email, password });
};




// src/lib/axios.ts

import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "/api",
});

export default axiosInstance;

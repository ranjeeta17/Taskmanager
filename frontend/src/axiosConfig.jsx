import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://3.104.109.215:5001', // live
  headers: { 'Content-Type': 'application/json' },
});

export default axiosInstance;

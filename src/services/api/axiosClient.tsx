import axios from "axios";

export const axiosClient = axios.create({
  baseURL: "https://api.deezer.com/",
  timeout: 10000,
});

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, message } = error;
    
    // If it's a network error or timeout, retry every 3 seconds
    if (!config || (message !== "Network Error" && !message.includes("timeout"))) {
      return Promise.reject(error);
    }

    console.log(`Network error detected. Retrying in 3 seconds...`);
    
    // Wait for 3 seconds
    await new Promise((resolve) => setTimeout(resolve, 3000));
    
    // Retry the request
    return axiosClient(config);
  }
);

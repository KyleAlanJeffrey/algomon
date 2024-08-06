import axios from "axios";
import { env } from "./env";

// Set config defaults when creating the instance
const api_instance = axios.create({
  baseURL: env.NEXT_PUBLIC_API_URL,
});

export const fetchAllVideos = async () => {
  const response = await api_instance.get("");
  return response;
};

export const fetchVideosByDateString = async (dateString: string) => {
  const response = await api_instance.get("?date=" + dateString);
  return response;
};

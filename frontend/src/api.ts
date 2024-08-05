import axios from "axios";
import { env } from "./env";

// Set config defaults when creating the instance
const api_instance = axios.create({
  baseURL: "http://localhost:3001",
});

export const fetchAllVideos = async () => {
  const response = await api_instance.get("/");
  return response;
};

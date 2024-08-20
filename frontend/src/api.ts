import axios, { AxiosResponse } from "axios";
import { env } from "./env";
import { WordAggregationResponse } from "./types";

// Set config defaults when creating the instance
const api_instance = axios.create({
  baseURL: env.NEXT_PUBLIC_API_URL,
});

export const fetchAllVideos = async () => {
  const response = await api_instance.get("");
  return response;
};
export const fetchWordAggregations = async (n: number) => {
  const response: AxiosResponse<WordAggregationResponse> =
    await api_instance.get("/words?n=" + n);
  if (response.status !== 200) {
    throw new Error("Failed to fetch videos");
  }
  if (!response.data) {
    throw new Error("No response found");
  }
  if (!response.data.wordData) {
    throw new Error("No word data found");
  }
  if (!response.data.videoMetrics) {
    throw new Error("No video metrics found");
  }
  return response;
};
export const fetchVideosByDateString = async (dateString: string) => {
  const response = await api_instance.get("?date=" + dateString);
  return response;
};

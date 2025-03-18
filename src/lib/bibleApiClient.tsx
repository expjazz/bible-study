import axios from "axios";

// Base URL for the ABibliaDigital API
const API_BASE_URL = "https://www.abibliadigital.com.br/api";

// Create a configured axios instance
export const bibleApiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Authorization: `Bearer ${process.env.BIBLE_API_KEY ?? ""}`,
  },
});

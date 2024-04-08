import axios from "axios";

export const privateService =
  axios.create({
    baseURL: "https://book-store-tan-five.vercel.app/",
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${
        typeof window !== "undefined" && window?.localStorage?.getItem("token")
      }`,
    },
  });

export const publicService = axios.create({
  baseURL: "https://book-store-tan-five.vercel.app/",
  headers: {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

import axios from 'axios';
import { TaggerFile } from "../types";

const apiUrl = 'http://localhost:3001/api/files';

export const getFiles = async (): Promise<TaggerFile[]> => {
  const response = await axios.get(`${apiUrl}`);
  return response.data;
}

export const uploadFile = async (file: File): Promise<TaggerFile> => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await axios.post(`${apiUrl}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
}

export const getFile = async (id: number): Promise<TaggerFile | null> => {
  try {
    const response = await axios.get(`${apiUrl}/${id}`);
    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export const searchByTags = async (query: string): Promise<TaggerFile[]> => {
  try {
    const tags = query.split(" ");
    const payload = {
      tags,
    }
    const response = await axios.post(`${apiUrl}/search`, payload);
    return response.data;
  } catch (error) {
    console.error(error);
    return [];
  }
}
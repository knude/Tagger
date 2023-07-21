import axios from 'axios';
import { TaggerFile, TaggerFiles, TaggerFileWithTags } from "../utils/types";

const apiUrl = 'http://localhost:3001/api/files';

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

export const deleteFile = async (id: number): Promise<void> => {
  const response = await axios.delete(`${apiUrl}/${id}`);
  return response.data;
}

export const getFile = async (id: number): Promise<TaggerFileWithTags> => {
  const response = await axios.get(`${apiUrl}/${id}`);
  return response.data;
}

export const searchForFiles = async (): Promise<TaggerFiles> => {
  const params = new URLSearchParams(window.location.search);
  const query = params.get('q');
  const page = params.get('page') || 1;

  const tags = query ? query.split(',') : [];
  const payload = {
    tags,
    page,
  }
  const response = await axios.post(`${apiUrl}/search`, payload);
  return response.data;
}

export const addTags = async (id: number, tags: string[]): Promise<TaggerFileWithTags | null> => {
  try {
    const payload = {
      tags,
    }
    const response = await axios.post(`${apiUrl}/${id}/tags`, payload);
    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
}
import axios from 'axios';
import { TaggerFile, TaggerFileWithTags } from "../types";

const apiUrl = 'http://localhost:3001/api/files';

export const getFiles = async (): Promise<TaggerFile[]> => {
  const response = await axios.get(`${apiUrl}`);
  return response.data;
}

export const uploadFile = async (file: File): Promise<TaggerFile | null> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axios.post(`${apiUrl}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export const getFile = async (id: number): Promise<TaggerFileWithTags> => {
  const response = await axios.get(`${apiUrl}/${id}`);
  return response.data;
}

export const searchByTags = async (): Promise<TaggerFile[]> => {
  const query = new URLSearchParams(window.location.search).get('q');
  const tags = query ? query.split(',') : [];
  const payload = {
    tags,
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
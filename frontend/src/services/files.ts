import axios from 'axios';
import { TaggerFile, TaggerFiles, TaggerFileWithTags, TaggerTags } from "../utils/types";
import { getToken } from "../utils/utils";

const apiUrl = 'http://localhost:3001/api/files';

export const uploadFile = async (file: File): Promise<TaggerFile> => {
  const config = {
    headers: {
      authorization: getToken(),
      'Content-Type': 'multipart/form-data'
    }
  }

  const formData = new FormData();
  formData.append('file', file);
  const response = await axios.post(`${apiUrl}`, formData, config);
  return response.data;
}

export const deleteFile = async (id: number): Promise<void> => {
  const config = { headers: { authorization: getToken() } }
  const response = await axios.delete(`${apiUrl}/${id}`, config);
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
  const tags = query ? query.split(' ') : [];

  let payload = {
    tags,
    page,
  }
  const response = await axios.post(`${apiUrl}/search`, payload);
  return response.data;
}

export const getUserFiles = async (): Promise<TaggerFiles> => {
  const config = { headers: { authorization: getToken() } }

  const params = new URLSearchParams(window.location.search);
  const page = params.get('page') || 1;

  const payload = {
    page,
  }
  const response = await axios.post(`${apiUrl}/user`, payload, config);
  return response.data;
}

export const addTags = async (id: number, tags: string[]): Promise<TaggerFileWithTags | null> => {
  try {
    const config = { headers: { authorization: getToken() } }
    const payload = {
      tags,
    }
    const response = await axios.post(`${apiUrl}/${id}/tags`, payload, config);
    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export const deleteTag = async (id: number, tagId: number): Promise<TaggerFileWithTags | null> => {
  try {
    const config = { headers: { authorization: getToken() } }
    const response = await axios.delete(`${apiUrl}/${id}/tags/${tagId}`, config);
    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export const getTopTags = async (tags: string[]): Promise<TaggerTags> => {
  const response = await axios.get(`${apiUrl}/tags`, { params: { tags: tags } });
  return response.data;
}
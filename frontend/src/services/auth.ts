import axios from 'axios';
import { getToken } from "../utils/utils";
const apiUrl = 'http://localhost:3001/api/auth';

export const isOwner = async (id: number): Promise<boolean> => {
  const config = { headers: { authorization: getToken() } }
  const response = await axios.get(`${apiUrl}/${id}/owner`, config);
  return response.data;
}
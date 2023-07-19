import axios from 'axios';
import { TaggerFile } from "../types";

const apiUrl = 'http://localhost:3001/api';

export const getFiles = async (): Promise<TaggerFile[]> => {
    const response = await axios.get(`${apiUrl}/files`);
    return response.data;
}

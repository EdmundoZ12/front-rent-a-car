import axios from 'axios';
import { environment } from '../../environments/environments';

export const api = axios.create({
  baseURL: environment.baseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

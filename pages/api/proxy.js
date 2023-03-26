// pages/api/proxy.js
import axios from 'axios';

export default async function handler(req, res) {
  const { url } = req.query;
  try {
    const response = await axios.get(url);
    res.status(200).json(response.data);
  } catch (error) {
    res.status(error.response.status).json({ message: error.message });
  }
}
import axios from "axios";
import { commerceApiBaseUrl } from "../contants/apiUrl"
import { createTokenService } from "./tokenService";

export const testService = async () => {
  const testEP = '/external/v1/pay-user/inquiries'

  const params = {
    'startSearchDate': '2024-11-14',
    'endSearchDate': '2024-12-14',
  }

  try {
    const { access_token } = await createTokenService();
    const res = await axios.get(`${commerceApiBaseUrl}${testEP}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${access_token}`
      },
      params
    })

    return res.data;
  } catch (error) {
    console.error(error);
  }
};
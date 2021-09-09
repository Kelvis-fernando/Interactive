import axiosInstace, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from 'axios';

import store from '@/store';

interface RetryProps {
  axios: AxiosInstance;
  url: string;
  options?: AxiosRequestConfig;
  retries?: number;
  attempt?: number;
}

const defaultRetries = window.location.href.match(/(localhost)/g) ? 0 : 4;

export const retry = async <T>({
  axios,
  url,
  options,
  retries = defaultRetries,
  attempt = 0,
}: RetryProps): Promise<AxiosResponse<T>> => {
  try {
    return await axios.request({ url, ...options });
  } catch (error) {
    if (attempt >= retries) {
      if (
        error.response &&
        error.response.data.message.match('Token invalid!')
      ) {
        store.commit('auth/destroySession');
        // toast.error(i18n.t('toast.sessionExpired'));
      }
      throw error;
    }

    return retry<T>({
      axios,
      url,
      options,
      retries,
      attempt: attempt + 1,
    });
  }
};

export const auth = axiosInstace.create({
  baseURL: process.env.VUE_APP_AUTH_URL,
  // withCredentials: true,
});

export const api = axiosInstace.create({
  baseURL: process.env.VUE_APP_API_URL,
  // withCredentials: true,
});

export const contentmanager = axiosInstace.create({
  baseURL: process.env.VUE_APP_CONTENT_MANAGER,
  // withCredentials: true,
});

export const datarefinery = axiosInstace.create({
  baseURL: process.env.VUE_APP_DATA_REFINERY,
  // withCredentials: true,
});

export const engagement = axiosInstace.create({
  baseURL: process.env.VUE_APP_ENGAGEMENT,
  // withCredentials: true,
});

export const idexchange = axiosInstace.create({
  baseURL: process.env.VUE_APP_IDEXCHANGE_URL,
  // withCredentials: true,
});

export const message = axiosInstace.create({
  baseURL: process.env.VUE_APP_MESSAGE,
  // withCredentials: true,
});

export default axiosInstace;

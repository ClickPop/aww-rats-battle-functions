import { AxiosInstance, AxiosStatic } from 'axios';
import { HasuraMetadataApiBody } from 'src/types';

const axios: AxiosStatic = jest.createMockFromModule('axios');
axios.create = jest.fn(
  () =>
    ({
      post: (url, data, config) => {
        const res: any = {
          data: {},
          config: config ?? {},
          status: 200,
          statusText: 'success',
          headers: {},
        };
        if (url === '/' && !!data) {
          switch ((data as unknown as HasuraMetadataApiBody).type) {
            case 'create_scheduled_event':
              if (
                (data as unknown as HasuraMetadataApiBody).args?.schedule_at ===
                'good-timestamp'
              ) {
                return Promise.resolve({
                  ...res,
                  data: { message: 'success', event_id: 'good-event-id' },
                });
              }
              return Promise.resolve({ ...res, data: { message: 'success' } });
            case 'delete_scheduled_event':
              if (
                (data as unknown as HasuraMetadataApiBody).args?.event_id ===
                'good-event-id'
              ) {
                return Promise.resolve({
                  ...res,
                  data: { message: 'success' },
                });
              }
              return Promise.resolve({ ...res, data: { message: 'success' } });
            default:
              break;
          }
        }
        return Promise.reject({
          ...res,
          status: 500,
          statusText: 'error',
        });
      },
    } as AxiosInstance),
);

export default axios;

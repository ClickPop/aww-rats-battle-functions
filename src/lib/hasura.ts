import axios from 'axios';
import {
  HASURA_ACTION_URL,
  HASURA_ADMIN_SECRET,
  HASURA_BASE_URL,
} from 'src/config/env';
import { sdk } from 'src/lib/graphql';
import { CreateScheduledEventBody, DeleteScheduledEventBody } from 'src/types';
const { updateRaid } = sdk;

export const hasura = axios.create({
  baseURL: `${HASURA_BASE_URL}/v1/metadata`,
  headers: { 'x-hasura-admin-secret': HASURA_ADMIN_SECRET },
});

export const hasuraMetadataApi = {
  createScheduledEvent: async (body: CreateScheduledEventBody) => {
    const res = await hasura.post<{ message: 'success'; event_id: string }>(
      '/',
      body,
    );
    return res.data;
  },

  deleteScheduledEvent: async (body: DeleteScheduledEventBody) => {
    const res = await hasura.post<{ message: 'success' }>('/', body);
    return res.data;
  },

  createRaidEndEvent: async (raid_id: number, timestamp: string) => {
    const data = await hasuraMetadataApi.createScheduledEvent({
      type: 'create_scheduled_event',
      args: {
        webhook: `${HASURA_ACTION_URL}/cron/handle-raid-end`,
        schedule_at: timestamp,
        headers: [{ name: 'authorization', value_from_env: 'WEBHOOK_API_KEY' }],
        payload: {
          raid_id,
        },
      },
    });

    if (data.message === 'success' && data.event_id) {
      await updateRaid({
        raid_id,
        input: { end_event_id: data.event_id },
      });
    }

    return data;
  },

  deleteRaidEndEvent: async (raid_id: number, event_id: string) => {
    const data = await hasuraMetadataApi.deleteScheduledEvent({
      type: 'delete_scheduled_event',
      args: {
        type: 'one_off',
        event_id: event_id,
      },
    });

    if (data.message === 'success') {
      await updateRaid({ raid_id, input: { end_event_id: null } });
    }

    return { ...data, event_id };
  },
};

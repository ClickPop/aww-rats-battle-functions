import { hasuraMetadataApi } from 'src/lib/hasura';

describe('Hasura Metadata API', () => {
  test('should return a success and event_id with valid create scheduled event', async () => {
    const data = await hasuraMetadataApi.createRaidEndEvent(
      69,
      'good-timestamp',
    );
    expect(data.message).toEqual('success');
    expect(data.event_id).toEqual('good-event-id');
  });
});

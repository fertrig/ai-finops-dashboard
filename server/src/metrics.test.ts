import request from 'supertest';
import { app, MAX_LOOKBACK_MS, DEFAULT_LOOKBACK_MS } from './index';

describe('GET /api/metrics', () => {
  describe('when since param is not provided', () => {
    it('should default to 5 minutes ago and return 200', async () => {
      const response = await request(app).get('/api/metrics');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('metrics');
      expect(response.body).toHaveProperty('nextPollAfter');
      expect(Array.isArray(response.body.metrics)).toBe(true);
    });
  });

  describe('when since param is a valid timestamp', () => {
    it('should return metrics for timestamp 30 seconds ago', async () => {
      const thirtySecondsAgo = Date.now() - 30 * 1000;
      const response = await request(app).get(`/api/metrics?since=${thirtySecondsAgo}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('metrics');
      expect(Array.isArray(response.body.metrics)).toBe(true);
    });

    it('should return metrics for timestamp 59 minutes ago (within 1 hour limit)', async () => {
      const fiftyNineMinutesAgo = Date.now() - 59 * 60 * 1000;
      const response = await request(app).get(`/api/metrics?since=${fiftyNineMinutesAgo}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('metrics');
    });
  });

  describe('when since param is not a number', () => {
    it('should return 400 for non-numeric string', async () => {
      const response = await request(app).get('/api/metrics?since=abc');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid "since" parameter. Must be a valid positive timestamp.');
    });

    it('should return 400 for empty string', async () => {
      const response = await request(app).get('/api/metrics?since=');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid "since" parameter. Must be a valid positive timestamp.');
    });

    it('should return 400 for special characters', async () => {
      const response = await request(app).get('/api/metrics?since=!@#$');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid "since" parameter. Must be a valid positive timestamp.');
    });
  });

  describe('when since param is less than 0', () => {
    it('should return 400 for negative timestamp', async () => {
      const response = await request(app).get('/api/metrics?since=-1');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid "since" parameter. Must be a valid positive timestamp.');
    });

    it('should return 400 for large negative timestamp', async () => {
      const response = await request(app).get('/api/metrics?since=-9999999999999');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid "since" parameter. Must be a valid positive timestamp.');
    });
  });

  describe('when since param is more than 1 hour ago', () => {
    it('should return 400 for timestamp exactly 1 hour + 1 second ago', async () => {
      const oneHourAndOneSecondAgo = Date.now() - MAX_LOOKBACK_MS - 1000;
      const response = await request(app).get(`/api/metrics?since=${oneHourAndOneSecondAgo}`);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid "since" parameter. Maximum lookback is 1 hour.');
    });

    it('should return 400 for timestamp 2 hours ago', async () => {
      const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000;
      const response = await request(app).get(`/api/metrics?since=${twoHoursAgo}`);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid "since" parameter. Maximum lookback is 1 hour.');
    });

    it('should return 400 for timestamp from year 2000', async () => {
      const year2000 = new Date('2000-01-01').getTime();
      const response = await request(app).get(`/api/metrics?since=${year2000}`);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid "since" parameter. Maximum lookback is 1 hour.');
    });
  });

  describe('when since param is in the future', () => {
    it('should return 400 for timestamp 1 second in the future', async () => {
      const oneSecondInFuture = Date.now() + 1000;
      const response = await request(app).get(`/api/metrics?since=${oneSecondInFuture}`);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid "since" parameter. Timestamp cannot be in the future.');
    });

    it('should return 400 for timestamp 1 hour in the future', async () => {
      const oneHourInFuture = Date.now() + 60 * 60 * 1000;
      const response = await request(app).get(`/api/metrics?since=${oneHourInFuture}`);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid "since" parameter. Timestamp cannot be in the future.');
    });

    it('should return 400 for timestamp in year 3000', async () => {
      const year3000 = new Date('3000-01-01').getTime();
      const response = await request(app).get(`/api/metrics?since=${year3000}`);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid "since" parameter. Timestamp cannot be in the future.');
    });
  });

  describe('integer overflow check', () => {
    it('should return 400 for value exceeding MAX_SAFE_INTEGER', async () => {
      const overflow = '9999999999999999999999';
      const response = await request(app).get(`/api/metrics?since=${overflow}`);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid "since" parameter. Must be a valid positive timestamp.');
    });

    it('should return 400 for Number.MAX_SAFE_INTEGER + 1', async () => {
      const overflow = (Number.MAX_SAFE_INTEGER + 1).toString();
      const response = await request(app).get(`/api/metrics?since=${overflow}`);

      expect(response.status).toBe(400);
      // MAX_SAFE_INTEGER + 1 exceeds the safe integer limit, caught by overflow check
      expect(response.body.error).toBe('Invalid "since" parameter. Must be a valid positive timestamp.');
    });

    it('should return 400 for very large number string', async () => {
      const response = await request(app).get('/api/metrics?since=1e100');

      expect(response.status).toBe(400);
      // parseInt('1e100', 10) returns 1, which is a valid number but far in the past
      expect(response.body.error).toBe('Invalid "since" parameter. Maximum lookback is 1 hour.');
    });
  });

  describe('constants are exported correctly', () => {
    it('should have MAX_LOOKBACK_MS equal to 1 hour', () => {
      expect(MAX_LOOKBACK_MS).toBe(60 * 60 * 1000);
    });

    it('should have DEFAULT_LOOKBACK_MS equal to 5 minutes', () => {
      expect(DEFAULT_LOOKBACK_MS).toBe(5 * 60 * 1000);
    });
  });
});

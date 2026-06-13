'use strict';

const request = require('supertest');
const app = require('../../src/app');

describe('LTM Azure SA Workshop — Unit Tests', () => {

  describe('GET /', () => {
    it('홈페이지가 Landing Zone 콘텐츠를 포함해야 함', async () => {
      const res = await request(app).get('/');
      expect(res.status).toBe(200);
      expect(res.text).toContain('LTM Korea');
      expect(res.text).toContain('Landing Zone');
      expect(res.text).toContain('Module 7');
    });
  });

  describe('GET /health', () => {
    it('status OK와 필수 필드를 반환해야 함', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('OK');
      expect(res.body).toHaveProperty('version');
      expect(res.body).toHaveProperty('uptime');
      expect(res.body).toHaveProperty('timestamp');
    });
  });

  describe('GET /api/modules', () => {
    it('7개 모듈을 반환해야 함', async () => {
      const res = await request(app).get('/api/modules');
      expect(res.status).toBe(200);
      expect(res.body.total).toBe(7);
      expect(res.body.completed).toBe(7);
      expect(Array.isArray(res.body.modules)).toBe(true);
    });

    it('각 모듈에 id, name, status, layer 필드가 있어야 함', async () => {
      const res = await request(app).get('/api/modules');
      res.body.modules.forEach(m => {
        expect(m).toHaveProperty('id');
        expect(m).toHaveProperty('name');
        expect(m).toHaveProperty('status', 'completed');
        expect(m).toHaveProperty('layer');
      });
    });
  });

  describe('GET /api/landing-zone', () => {
    it('Landing Zone 구조를 반환해야 함', async () => {
      const res = await request(app).get('/api/landing-zone');
      expect(res.status).toBe(200);
      expect(res.body.managementGroup).toBe('LTM-Corp');
      expect(res.body.region).toBe('koreacentral');
      expect(Array.isArray(res.body.layers)).toBe(true);
      expect(res.body.layers.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/status', () => {
    it('서비스 상태 정보를 반환해야 함', async () => {
      const res = await request(app).get('/api/status');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('running');
      expect(res.body).toHaveProperty('version');
      expect(res.body).toHaveProperty('environment');
    });
  });

  describe('GET /metrics', () => {
    it('Prometheus 메트릭을 반환해야 함', async () => {
      const res = await request(app).get('/metrics');
      expect(res.status).toBe(200);
      expect(res.text).toContain('http_requests_total');
    });
  });

  describe('GET /nonexistent', () => {
    it('404를 반환해야 함', async () => {
      const res = await request(app).get('/nonexistent');
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error', 'Not Found');
    });
  });
});

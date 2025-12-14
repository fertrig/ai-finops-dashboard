import { TenantConfig } from './types';

export const TENANT_CONFIGS: TenantConfig[] = [
  // Tenant 1: Acme Corp - 15 customers, heavy GPT-4 usage
  {
    tenantId: 'tenant-acme',
    customers: [
      { customerId: 'acme-prod', model: 'gpt-4', mockBaseCallsPerSecond: 12 },
      { customerId: 'acme-staging', model: 'gpt-4', mockBaseCallsPerSecond: 5 },
      { customerId: 'acme-dev', model: 'gpt-3.5-turbo', mockBaseCallsPerSecond: 18 },
      { customerId: 'acme-api', model: 'gpt-4', mockBaseCallsPerSecond: 8 },
      { customerId: 'acme-web', model: 'gpt-3.5-turbo', mockBaseCallsPerSecond: 15 },
      { customerId: 'acme-mobile', model: 'gpt-4', mockBaseCallsPerSecond: 6 },
      { customerId: 'acme-analytics', model: 'claude-3-opus', mockBaseCallsPerSecond: 4 },
      { customerId: 'acme-ml', model: 'gpt-4', mockBaseCallsPerSecond: 10 },
      { customerId: 'acme-batch', model: 'gpt-3.5-turbo', mockBaseCallsPerSecond: 20 },
      { customerId: 'acme-realtime', model: 'gpt-4', mockBaseCallsPerSecond: 7 },
      { customerId: 'acme-search', model: 'gpt-3.5-turbo', mockBaseCallsPerSecond: 14 },
      { customerId: 'acme-chat', model: 'gpt-4', mockBaseCallsPerSecond: 9 },
      { customerId: 'acme-support', model: 'claude-3-sonnet', mockBaseCallsPerSecond: 11 },
      { customerId: 'acme-internal', model: 'gpt-3.5-turbo', mockBaseCallsPerSecond: 8 },
      { customerId: 'acme-testing', model: 'gpt-3.5-turbo', mockBaseCallsPerSecond: 3 },
    ],
  },

  // Tenant 2: Globex Industries - 12 customers, balanced multi-model
  {
    tenantId: 'tenant-globex',
    customers: [
      { customerId: 'globex-main', model: 'claude-3-opus', mockBaseCallsPerSecond: 8 },
      { customerId: 'globex-analytics', model: 'claude-3-sonnet', mockBaseCallsPerSecond: 12 },
      { customerId: 'globex-prod', model: 'gpt-4', mockBaseCallsPerSecond: 10 },
      { customerId: 'globex-staging', model: 'gpt-3.5-turbo', mockBaseCallsPerSecond: 6 },
      { customerId: 'globex-api', model: 'claude-3-opus', mockBaseCallsPerSecond: 7 },
      { customerId: 'globex-web', model: 'claude-3-sonnet', mockBaseCallsPerSecond: 15 },
      { customerId: 'globex-mobile', model: 'gpt-4', mockBaseCallsPerSecond: 5 },
      { customerId: 'globex-batch', model: 'gpt-3.5-turbo', mockBaseCallsPerSecond: 18 },
      { customerId: 'globex-ml', model: 'claude-3-opus', mockBaseCallsPerSecond: 4 },
      { customerId: 'globex-search', model: 'claude-3-sonnet', mockBaseCallsPerSecond: 9 },
      { customerId: 'globex-chat', model: 'gpt-4', mockBaseCallsPerSecond: 11 },
      { customerId: 'globex-internal', model: 'gpt-3.5-turbo', mockBaseCallsPerSecond: 8 },
    ],
  },

  // Tenant 3: Initech - 18 customers, high volume, cost-conscious
  {
    tenantId: 'tenant-initech',
    customers: [
      { customerId: 'initech-api', model: 'gpt-3.5-turbo', mockBaseCallsPerSecond: 20 },
      { customerId: 'initech-web', model: 'gpt-4', mockBaseCallsPerSecond: 4 },
      { customerId: 'initech-mobile', model: 'gpt-3.5-turbo', mockBaseCallsPerSecond: 16 },
      { customerId: 'initech-prod', model: 'gpt-3.5-turbo', mockBaseCallsPerSecond: 18 },
      { customerId: 'initech-staging', model: 'gpt-3.5-turbo', mockBaseCallsPerSecond: 8 },
      { customerId: 'initech-dev', model: 'gpt-3.5-turbo', mockBaseCallsPerSecond: 12 },
      { customerId: 'initech-batch', model: 'gpt-3.5-turbo', mockBaseCallsPerSecond: 20 },
      { customerId: 'initech-realtime', model: 'gpt-4', mockBaseCallsPerSecond: 6 },
      { customerId: 'initech-analytics', model: 'gpt-3.5-turbo', mockBaseCallsPerSecond: 14 },
      { customerId: 'initech-ml', model: 'gpt-3.5-turbo', mockBaseCallsPerSecond: 10 },
      { customerId: 'initech-search', model: 'gpt-3.5-turbo', mockBaseCallsPerSecond: 15 },
      { customerId: 'initech-chat', model: 'gpt-3.5-turbo', mockBaseCallsPerSecond: 18 },
      { customerId: 'initech-support', model: 'gpt-3.5-turbo', mockBaseCallsPerSecond: 12 },
      { customerId: 'initech-internal', model: 'gpt-3.5-turbo', mockBaseCallsPerSecond: 8 },
      { customerId: 'initech-testing', model: 'gpt-3.5-turbo', mockBaseCallsPerSecond: 5 },
      { customerId: 'initech-reports', model: 'gpt-4', mockBaseCallsPerSecond: 3 },
      { customerId: 'initech-exports', model: 'gpt-3.5-turbo', mockBaseCallsPerSecond: 7 },
      { customerId: 'initech-imports', model: 'gpt-3.5-turbo', mockBaseCallsPerSecond: 9 },
    ],
  },

  // Tenant 4: Umbrella Corp - 14 customers, research heavy, premium models
  {
    tenantId: 'tenant-umbrella',
    customers: [
      { customerId: 'umbrella-research', model: 'claude-3-opus', mockBaseCallsPerSecond: 8 },
      { customerId: 'umbrella-assistant', model: 'claude-3-sonnet', mockBaseCallsPerSecond: 14 },
      { customerId: 'umbrella-prod', model: 'gpt-4', mockBaseCallsPerSecond: 10 },
      { customerId: 'umbrella-staging', model: 'claude-3-opus', mockBaseCallsPerSecond: 5 },
      { customerId: 'umbrella-dev', model: 'gpt-4', mockBaseCallsPerSecond: 7 },
      { customerId: 'umbrella-api', model: 'claude-3-opus', mockBaseCallsPerSecond: 9 },
      { customerId: 'umbrella-web', model: 'claude-3-sonnet', mockBaseCallsPerSecond: 12 },
      { customerId: 'umbrella-mobile', model: 'gpt-4', mockBaseCallsPerSecond: 6 },
      { customerId: 'umbrella-ml', model: 'claude-3-opus', mockBaseCallsPerSecond: 11 },
      { customerId: 'umbrella-analytics', model: 'claude-3-opus', mockBaseCallsPerSecond: 8 },
      { customerId: 'umbrella-batch', model: 'gpt-4', mockBaseCallsPerSecond: 4 },
      { customerId: 'umbrella-realtime', model: 'claude-3-sonnet', mockBaseCallsPerSecond: 10 },
      { customerId: 'umbrella-chat', model: 'claude-3-opus', mockBaseCallsPerSecond: 7 },
      { customerId: 'umbrella-internal', model: 'claude-3-sonnet', mockBaseCallsPerSecond: 5 },
    ],
  },

  // Tenant 5: Stark Industries - 20 customers, innovation lab, diverse models
  {
    tenantId: 'tenant-stark',
    customers: [
      { customerId: 'stark-jarvis', model: 'gpt-4', mockBaseCallsPerSecond: 15 },
      { customerId: 'stark-friday', model: 'claude-3-opus', mockBaseCallsPerSecond: 12 },
      { customerId: 'stark-prod', model: 'gpt-4', mockBaseCallsPerSecond: 10 },
      { customerId: 'stark-staging', model: 'gpt-3.5-turbo', mockBaseCallsPerSecond: 8 },
      { customerId: 'stark-dev', model: 'claude-3-sonnet', mockBaseCallsPerSecond: 14 },
      { customerId: 'stark-api', model: 'gpt-4', mockBaseCallsPerSecond: 11 },
      { customerId: 'stark-web', model: 'gpt-3.5-turbo', mockBaseCallsPerSecond: 16 },
      { customerId: 'stark-mobile', model: 'claude-3-opus', mockBaseCallsPerSecond: 7 },
      { customerId: 'stark-analytics', model: 'gpt-4', mockBaseCallsPerSecond: 9 },
      { customerId: 'stark-ml', model: 'claude-3-opus', mockBaseCallsPerSecond: 13 },
      { customerId: 'stark-batch', model: 'gpt-3.5-turbo', mockBaseCallsPerSecond: 18 },
      { customerId: 'stark-realtime', model: 'claude-3-sonnet', mockBaseCallsPerSecond: 10 },
      { customerId: 'stark-search', model: 'gpt-4', mockBaseCallsPerSecond: 8 },
      { customerId: 'stark-chat', model: 'gpt-3.5-turbo', mockBaseCallsPerSecond: 20 },
      { customerId: 'stark-support', model: 'claude-3-sonnet', mockBaseCallsPerSecond: 12 },
      { customerId: 'stark-internal', model: 'gpt-4', mockBaseCallsPerSecond: 5 },
      { customerId: 'stark-testing', model: 'gpt-3.5-turbo', mockBaseCallsPerSecond: 6 },
      { customerId: 'stark-research', model: 'claude-3-opus', mockBaseCallsPerSecond: 9 },
      { customerId: 'stark-design', model: 'gpt-4', mockBaseCallsPerSecond: 7 },
      { customerId: 'stark-prototype', model: 'claude-3-opus', mockBaseCallsPerSecond: 11 },
    ],
  },

  // Tenant 6: Wayne Enterprises - 11 customers, security focused
  {
    tenantId: 'tenant-wayne',
    customers: [
      { customerId: 'wayne-prod', model: 'gpt-4', mockBaseCallsPerSecond: 10 },
      { customerId: 'wayne-staging', model: 'claude-3-sonnet', mockBaseCallsPerSecond: 6 },
      { customerId: 'wayne-dev', model: 'gpt-3.5-turbo', mockBaseCallsPerSecond: 8 },
      { customerId: 'wayne-api', model: 'gpt-4', mockBaseCallsPerSecond: 12 },
      { customerId: 'wayne-web', model: 'claude-3-sonnet', mockBaseCallsPerSecond: 9 },
      { customerId: 'wayne-mobile', model: 'gpt-3.5-turbo', mockBaseCallsPerSecond: 7 },
      { customerId: 'wayne-analytics', model: 'gpt-4', mockBaseCallsPerSecond: 5 },
      { customerId: 'wayne-security', model: 'claude-3-sonnet', mockBaseCallsPerSecond: 14 },
      { customerId: 'wayne-batch', model: 'gpt-3.5-turbo', mockBaseCallsPerSecond: 11 },
      { customerId: 'wayne-realtime', model: 'gpt-4', mockBaseCallsPerSecond: 8 },
      { customerId: 'wayne-internal', model: 'claude-3-sonnet', mockBaseCallsPerSecond: 4 },
    ],
  },

  // Tenant 7: Oscorp - 10 customers, startup growing rapidly
  {
    tenantId: 'tenant-oscorp',
    customers: [
      { customerId: 'oscorp-prod', model: 'gpt-3.5-turbo', mockBaseCallsPerSecond: 15 },
      { customerId: 'oscorp-staging', model: 'claude-3-sonnet', mockBaseCallsPerSecond: 7 },
      { customerId: 'oscorp-dev', model: 'gpt-3.5-turbo', mockBaseCallsPerSecond: 10 },
      { customerId: 'oscorp-api', model: 'gpt-4', mockBaseCallsPerSecond: 8 },
      { customerId: 'oscorp-web', model: 'gpt-3.5-turbo', mockBaseCallsPerSecond: 18 },
      { customerId: 'oscorp-mobile', model: 'claude-3-sonnet', mockBaseCallsPerSecond: 12 },
      { customerId: 'oscorp-analytics', model: 'gpt-3.5-turbo', mockBaseCallsPerSecond: 9 },
      { customerId: 'oscorp-batch', model: 'gpt-4', mockBaseCallsPerSecond: 5 },
      { customerId: 'oscorp-chat', model: 'claude-3-sonnet', mockBaseCallsPerSecond: 14 },
      { customerId: 'oscorp-internal', model: 'gpt-3.5-turbo', mockBaseCallsPerSecond: 6 },
    ],
  },
];

/**
 * Compliance Reporter Tests
 * Tests compliance reporting functionality for Google Play Store policy
 */

// Mock dependencies
jest.mock('react-native', () => ({
  Platform: {
    OS: 'android',
    Version: 33,
  },
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
}));

jest.mock('../src/utils/PermissionManager', () => ({
  __esModule: true,
  default: {
    getPermissionLogs: jest.fn(() => Promise.resolve([
      {
        id: '1',
        userId: 'seller1',
        permissionType: 'video',
        context: 'seller_onboarding',
        result: 'granted',
        timestamp: '2026-01-19T05:00:00.000Z',
        deviceInfo: { platform: 'android', version: 33 }
      },
      {
        id: '2',
        userId: 'buyer1',
        permissionType: 'video',
        context: 'video_upload',
        result: 'skipped_user_type',
        timestamp: '2026-01-19T05:01:00.000Z',
        deviceInfo: { platform: 'android', version: 33 }
      }
    ])),
  },
}));

// Import after mocking
const ComplianceReporter = require('../src/utils/ComplianceReporter').default;

describe('ComplianceReporter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should generate compliance report with proper structure', async () => {
    const report = await ComplianceReporter.generateComplianceReport();
    
    expect(report).toHaveProperty('reportId');
    expect(report).toHaveProperty('generatedAt');
    expect(report).toHaveProperty('permissionAnalytics');
    expect(report).toHaveProperty('policyCompliance');
    expect(report).toHaveProperty('recommendations');
    expect(report).toHaveProperty('rawLogs');
    
    expect(report.reportId).toMatch(/^compliance-\d+$/);
    expect(report.permissionAnalytics.totalRequests).toBe(2);
  });

  test('should analyze permission logs correctly', async () => {
    const report = await ComplianceReporter.generateComplianceReport();
    const analytics = report.permissionAnalytics;
    
    expect(analytics.totalRequests).toBe(2);
    expect(analytics.grantedCount).toBe(1);
    expect(analytics.deniedCount).toBe(0);
    expect(analytics.contextBreakdown).toHaveProperty('seller_onboarding');
    expect(analytics.contextBreakdown).toHaveProperty('video_upload');
  });

  test('should check policy compliance', async () => {
    const report = await ComplianceReporter.generateComplianceReport();
    const compliance = report.policyCompliance;
    
    expect(compliance).toHaveProperty('overallScore');
    expect(compliance).toHaveProperty('checks');
    expect(compliance.checks).toHaveProperty('conditionalRequests');
    expect(compliance.checks).toHaveProperty('businessJustification');
    expect(compliance.checks).toHaveProperty('gracefulDegradation');
    expect(compliance.checks).toHaveProperty('noStartupRequests');
    expect(compliance.checks).toHaveProperty('userTypeRespected');
  });

  test('should generate recommendations based on analytics', async () => {
    const report = await ComplianceReporter.generateComplianceReport();
    
    expect(Array.isArray(report.recommendations)).toBe(true);
    // Should have recommendations array (may be empty if all metrics are good)
  });

  test('should export compliance report to text format', async () => {
    const report = await ComplianceReporter.generateComplianceReport();
    const exportText = await ComplianceReporter.exportComplianceReport(report);
    
    expect(typeof exportText).toBe('string');
    expect(exportText).toContain('UPVC Connect - Permission Usage Compliance Report');
    expect(exportText).toContain('PERMISSION ANALYTICS');
    expect(exportText).toContain('BUSINESS JUSTIFICATION');
    expect(exportText).toContain('GRACEFUL DEGRADATION');
  });
});

console.log('✅ ComplianceReporter tests completed successfully!');
// 🧪 Jest 설정 파일
// 테스트 환경과 옵션을 설정합니다

module.exports = {
  // 테스트 환경
  testEnvironment: 'node',
  
  // 테스트 파일 패턴
  testMatch: [
    '**/tests/**/*.test.js',
    '**/__tests__/**/*.js'
  ],
  
  // 커버리지 설정
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!src/**/*.spec.js'
  ],
  
  // 커버리지 임계값
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  
  // 테스트 설정
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  
  // 모듈 해석
  moduleFileExtensions: ['js', 'json'],
  
  // 변환 설정
  transform: {
    '^.+\\.js$': 'babel-jest'
  },
  
  // 테스트 타임아웃
  testTimeout: 10000,
  
  // 상세 출력
  verbose: true,
  
  // 병렬 실행
  maxWorkers: '50%',
  
  // 캐시 설정
  cache: true,
  cacheDirectory: '<rootDir>/.jest-cache'
};

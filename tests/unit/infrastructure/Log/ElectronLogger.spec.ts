import { describe, expect } from 'vitest';
import { ElectronLog } from 'electron-log';
import { StubWithObservableMethodCalls } from '@tests/unit/shared/Stubs/StubWithObservableMethodCalls';
import { createElectronLogger } from '@/infrastructure/Log/ElectronLogger';
import { itEachAbsentObjectValue } from '@tests/unit/shared/TestCases/AbsentTests';
import { itEachLoggingMethod } from './LoggerTestRunner';

describe('ElectronLogger', () => {
  describe('throws if logger is missing', () => {
    itEachAbsentObjectValue((absentValue) => {
      // arrange
      const expectedError = 'missing logger';
      const electronLog = absentValue;
      // act
      const act = () => createElectronLogger(electronLog);
      // assert
      expect(act).to.throw(expectedError);
    }, { excludeUndefined: true });
  });
  itEachLoggingMethod((functionName, testParameters) => {
    // arrange
    const expectedParams = testParameters;
    const electronLogMock = new MockElectronLog();
    const logger = createElectronLogger(electronLogMock);

    // act
    logger[functionName](...expectedParams);

    // assert
    expect(electronLogMock.callHistory).to.have.lengthOf(1);
    expect(electronLogMock.callHistory[0].methodName).to.equal(functionName);
    expect(electronLogMock.callHistory[0].args).to.deep.equal(expectedParams);
  });
});

class MockElectronLog
  extends StubWithObservableMethodCalls<Partial<ElectronLog>>
  implements Partial<ElectronLog> {
  public info(...args: unknown[]) {
    this.registerMethodCall({
      methodName: 'info',
      args,
    });
  }
}

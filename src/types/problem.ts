type TestCaseResult = {
  code: number;
  passed: boolean;
  inputArguments: string;
  expectedResult: string;
  executionResult: string;
};

type ProblemExecutionResult = {
  correctTestCases: number;
  testCaseResults: TestCaseResult[];
};

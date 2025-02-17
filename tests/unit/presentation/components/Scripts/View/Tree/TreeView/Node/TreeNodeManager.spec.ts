import { describe, it, expect } from 'vitest';
import { TreeNodeManager } from '@/presentation/components/Scripts/View/Tree/TreeView/Node/TreeNodeManager';
import { itEachAbsentObjectValue, itEachAbsentStringValue } from '@tests/unit/shared/TestCases/AbsentTests';
import { TreeNodeHierarchy } from '@/presentation/components/Scripts/View/Tree/TreeView/Node/Hierarchy/TreeNodeHierarchy';
import { TreeNodeState } from '@/presentation/components/Scripts/View/Tree/TreeView/Node/State/TreeNodeState';

describe('TreeNodeManager', () => {
  describe('constructor', () => {
    describe('id', () => {
      it('should initialize with the provided id', () => {
        // arrange
        const expectedId = 'test-id';
        // act
        const node = new TreeNodeManager(expectedId);
        // assert
        expect(node.id).to.equal(expectedId);
      });
      describe('should throw an error if id is not provided', () => {
        itEachAbsentStringValue((absentId) => {
          // arrange
          const expectedError = 'missing id';
          // act
          const act = () => new TreeNodeManager(absentId);
          // assert
          expect(act).to.throw(expectedError);
        });
      });
    });

    describe('metadata', () => {
      it('should initialize with the provided metadata', () => {
        // arrange
        const expectedMetadata = { key: 'value' };
        // act
        const node = new TreeNodeManager('id', expectedMetadata);
        // assert
        expect(node.metadata).to.equal(expectedMetadata);
      });
      describe('should accept absent metadata', () => {
        itEachAbsentObjectValue((absentMetadata) => {
          // arrange
          const expectedMetadata = absentMetadata;
          // act
          const node = new TreeNodeManager('id', expectedMetadata);
          // assert
          expect(node.metadata).to.equal(absentMetadata);
        });
      });
    });

    describe('hierarchy', () => {
      it(`should initialize as an instance of ${TreeNodeHierarchy.name}`, () => {
        // arrange
        const expectedType = TreeNodeHierarchy;
        // act
        const node = new TreeNodeManager('id');
        // assert
        expect(node.hierarchy).to.be.an.instanceOf(expectedType);
      });
    });

    describe('state', () => {
      it(`should initialize as an instance of ${TreeNodeState.name}`, () => {
        // arrange
        const expectedType = TreeNodeState;
        // act
        const node = new TreeNodeManager('id');
        // assert
        expect(node.state).to.be.an.instanceOf(expectedType);
      });
    });
  });
});

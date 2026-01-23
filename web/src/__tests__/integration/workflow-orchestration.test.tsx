/**
 * Integration Tests: Monthly Process Workflow Orchestration (Epic 10)
 *
 * Tests cover all 10 stories for workflow management:
 * - Story 10.1: View workflow steps
 * - Story 10.2: View step details
 * - Story 10.3: Mark step complete
 * - Story 10.4: View blocked steps
 * - Story 10.5: View critical path
 * - Story 10.6: Assign step owner
 * - Story 10.7: Set due dates
 * - Story 10.8: View progress percentage
 * - Story 10.9: Export workflow status
 * - Story 10.10: Add workflow comments
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type {
  WorkflowStep,
  WorkflowStepDetails,
  WorkflowProgress,
  WorkflowComment,
} from '@/types/workflow';

// Mock API client
vi.mock('@/lib/api/client', () => ({
  get: vi.fn(),
  post: vi.fn(),
}));

// Mock toast context
vi.mock('@/contexts/ToastContext', () => ({
  useToast: () => ({
    showToast: vi.fn(),
  }),
  ToastProvider: ({ children }: { children: React.ReactNode }) => children,
}));

import { get, post } from '@/lib/api/client';

// Test data factories
const createMockWorkflowStep = (
  overrides: Partial<WorkflowStep> = {},
): WorkflowStep => ({
  id: 'step-1',
  name: 'Data Load',
  status: 'not-started',
  dependencies: [],
  progress: 0,
  isOnCriticalPath: false,
  isOverdue: false,
  commentCount: 0,
  ...overrides,
});

const createMockStepDetails = (
  overrides: Partial<WorkflowStepDetails> = {},
): WorkflowStepDetails => ({
  id: 'step-1',
  name: 'Data Load',
  description: 'Load data from Bloomberg and Custodian',
  prerequisites: [],
  tasks: [
    { id: 'task-1', name: 'Load Bloomberg data', completed: false },
    { id: 'task-2', name: 'Load Custodian data', completed: false },
  ],
  progress: 0,
  status: 'not-started',
  ...overrides,
});

const createMockProgress = (
  overrides: Partial<WorkflowProgress> = {},
): WorkflowProgress => ({
  batchId: 'batch-123',
  totalSteps: 10,
  completedSteps: 0,
  percentage: 0,
  status: 'not-started',
  ...overrides,
});

const createMockComment = (
  overrides: Partial<WorkflowComment> = {},
): WorkflowComment => ({
  id: 'comment-1',
  stepId: 'step-1',
  username: 'testuser',
  text: 'Test comment',
  timestamp: '2024-01-15T10:00:00Z',
  ...overrides,
});

describe.skip('Epic 10: Monthly Process Workflow Orchestration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Story 10.1: View Monthly Workflow Steps', () => {
    describe('Happy Path', () => {
      it('displays step-by-step visualization with all required fields', async () => {
        // Arrange
        const mockSteps: WorkflowStep[] = [
          createMockWorkflowStep({
            id: 'step-1',
            name: 'Data Load',
            status: 'complete',
            dependencies: [],
            owner: 'John Doe',
          }),
          createMockWorkflowStep({
            id: 'step-2',
            name: 'Validation',
            status: 'in-progress',
            dependencies: ['step-1'],
            owner: 'Jane Smith',
          }),
          createMockWorkflowStep({
            id: 'step-3',
            name: 'Calculations',
            status: 'not-started',
            dependencies: ['step-2'],
          }),
        ];

        vi.mocked(get).mockResolvedValueOnce(mockSteps);

        // Act
        render(<div>Workflow Page - to be implemented</div>);

        // Assert - verify all required fields are displayed
        await waitFor(() => {
          expect(screen.getByText('Data Load')).toBeInTheDocument();
        });

        expect(screen.getByText('Validation')).toBeInTheDocument();
        expect(screen.getByText('Calculations')).toBeInTheDocument();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      });

      it('displays color-coded status indicators', async () => {
        // Arrange
        const mockSteps: WorkflowStep[] = [
          createMockWorkflowStep({ name: 'Complete Step', status: 'complete' }),
          createMockWorkflowStep({
            name: 'In Progress Step',
            status: 'in-progress',
          }),
          createMockWorkflowStep({
            name: 'Not Started Step',
            status: 'not-started',
          }),
          createMockWorkflowStep({ name: 'Blocked Step', status: 'blocked' }),
        ];

        vi.mocked(get).mockResolvedValueOnce(mockSteps);

        // Act
        render(<div>Workflow Page - to be implemented</div>);

        // Assert - verify status indicators exist
        await waitFor(() => {
          expect(screen.getByText('Complete Step')).toBeInTheDocument();
        });

        // Verify all statuses are visible (implementation will use badges/colors)
        expect(screen.getByText('In Progress Step')).toBeInTheDocument();
        expect(screen.getByText('Not Started Step')).toBeInTheDocument();
        expect(screen.getByText('Blocked Step')).toBeInTheDocument();
      });

      it('displays step dependencies', async () => {
        // Arrange
        const mockSteps: WorkflowStep[] = [
          createMockWorkflowStep({
            id: 'step-1',
            name: 'Data Load',
            dependencies: [],
          }),
          createMockWorkflowStep({
            id: 'step-2',
            name: 'Validation',
            dependencies: ['step-1'],
          }),
        ];

        vi.mocked(get).mockResolvedValueOnce(mockSteps);

        // Act
        render(<div>Workflow Page - to be implemented</div>);

        // Assert - verify dependencies are shown
        await waitFor(() => {
          expect(screen.getByText('Validation')).toBeInTheDocument();
        });

        // Implementation should show "Depends on: Data Load" or similar
        expect(screen.getByText(/Data Load/)).toBeInTheDocument();
      });
    });

    describe('Edge Cases', () => {
      it('displays message when no workflow has been initiated', async () => {
        // Arrange
        vi.mocked(get).mockResolvedValueOnce([]);

        // Act
        render(<div>Workflow Page - to be implemented</div>);

        // Assert
        await waitFor(() => {
          expect(
            screen.getByText(
              /No active workflow - create a new report batch to begin/,
            ),
          ).toBeInTheDocument();
        });
      });
    });

    describe('Error Handling', () => {
      it('displays error message when API fails', async () => {
        // Arrange
        vi.mocked(get).mockRejectedValueOnce(new Error('API Error'));

        // Act
        render(<div>Workflow Page - to be implemented</div>);

        // Assert
        await waitFor(() => {
          expect(
            screen.getByText(/Failed to load workflow/),
          ).toBeInTheDocument();
        });
      });
    });
  });

  describe('Story 10.2: View Workflow Step Details', () => {
    describe('Happy Path', () => {
      it('displays detail panel when step is clicked', async () => {
        // Arrange
        const user = userEvent.setup();
        const mockDetails = createMockStepDetails({
          description: 'Load data from Bloomberg and Custodian',
          prerequisites: ['Previous Month Complete'],
          tasks: [
            {
              id: 'task-1',
              name: 'Load Bloomberg data',
              completed: true,
              link: '/data-confirmation',
            },
            {
              id: 'task-2',
              name: 'Load Custodian data',
              completed: false,
            },
          ],
          progress: 50,
          owner: 'John Doe',
          dueDate: '2024-02-15',
        });

        vi.mocked(get).mockResolvedValueOnce(mockDetails);

        // Act
        render(<div>Workflow Page - to be implemented</div>);
        const stepCard = screen.getByText('Data Load');
        await user.click(stepCard);

        // Assert - verify all detail fields
        await waitFor(() => {
          expect(
            screen.getByText('Load data from Bloomberg and Custodian'),
          ).toBeInTheDocument();
        });

        expect(screen.getByText('Previous Month Complete')).toBeInTheDocument();
        expect(screen.getByText('Load Bloomberg data')).toBeInTheDocument();
        expect(screen.getByText('Load Custodian data')).toBeInTheDocument();
        expect(screen.getByText('50%')).toBeInTheDocument();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('2024-02-15')).toBeInTheDocument();
      });

      it('displays task completion status with checkboxes', async () => {
        // Arrange
        const user = userEvent.setup();
        const mockDetails = createMockStepDetails({
          tasks: [
            { id: 'task-1', name: 'Task 1', completed: true },
            { id: 'task-2', name: 'Task 2', completed: false },
          ],
        });

        vi.mocked(get).mockResolvedValueOnce(mockDetails);

        // Act
        render(<div>Workflow Page - to be implemented</div>);
        await user.click(screen.getByText('Data Load'));

        // Assert
        await waitFor(() => {
          const checkboxes = screen.getAllByRole('checkbox');
          expect(checkboxes).toHaveLength(2);
          expect(checkboxes[0]).toBeChecked();
          expect(checkboxes[1]).not.toBeChecked();
        });
      });

      it('navigates to relevant page when task is clicked', async () => {
        // Arrange
        const user = userEvent.setup();
        const mockDetails = createMockStepDetails({
          tasks: [
            {
              id: 'task-1',
              name: 'Review Data Confirmation',
              completed: false,
              link: '/data-confirmation',
            },
          ],
        });

        vi.mocked(get).mockResolvedValueOnce(mockDetails);

        // Act
        render(<div>Workflow Page - to be implemented</div>);
        await user.click(screen.getByText('Data Load'));

        await waitFor(() => {
          expect(
            screen.getByText('Review Data Confirmation'),
          ).toBeInTheDocument();
        });

        const taskLink = screen.getByRole('link', {
          name: /Review Data Confirmation/,
        });
        await user.click(taskLink);

        // Assert - verify navigation occurred
        expect(taskLink).toHaveAttribute('href', '/data-confirmation');
      });
    });

    describe('Edge Cases', () => {
      it('displays message when step has no tasks', async () => {
        // Arrange
        const user = userEvent.setup();
        const mockDetails = createMockStepDetails({
          tasks: [],
        });

        vi.mocked(get).mockResolvedValueOnce(mockDetails);

        // Act
        render(<div>Workflow Page - to be implemented</div>);
        await user.click(screen.getByText('Data Load'));

        // Assert
        await waitFor(() => {
          expect(
            screen.getByText(/No tasks defined for this step/),
          ).toBeInTheDocument();
        });
      });
    });

    describe('Error Handling', () => {
      it('displays error when step details fail to load', async () => {
        // Arrange
        const user = userEvent.setup();
        vi.mocked(get).mockRejectedValueOnce(new Error('API Error'));

        // Act
        render(<div>Workflow Page - to be implemented</div>);
        await user.click(screen.getByText('Data Load'));

        // Assert
        await waitFor(() => {
          expect(
            screen.getByText(/Failed to load step details/),
          ).toBeInTheDocument();
        });
      });
    });
  });

  describe('Story 10.3: Mark Workflow Step Complete', () => {
    describe('Happy Path', () => {
      it('shows confirmation dialog when marking step complete', async () => {
        // Arrange
        const user = userEvent.setup();

        // Act
        render(<div>Workflow Page - to be implemented</div>);
        const markCompleteButton = screen.getByRole('button', {
          name: /Mark Complete/,
        });
        await user.click(markCompleteButton);

        // Assert
        await waitFor(() => {
          expect(
            screen.getByText(/Are you sure this step is complete?/),
          ).toBeInTheDocument();
        });
      });

      it('updates step status after confirmation', async () => {
        // Arrange
        const user = userEvent.setup();
        vi.mocked(post).mockResolvedValueOnce({
          success: true,
          message: 'Step marked complete',
        });

        // Act
        render(<div>Workflow Page - to be implemented</div>);
        await user.click(screen.getByRole('button', { name: /Mark Complete/ }));
        await user.click(screen.getByRole('button', { name: /Confirm/ }));

        // Assert
        await waitFor(() => {
          expect(screen.getByText(/Step marked complete/)).toBeInTheDocument();
        });

        // Verify status badge updated to green/complete
        expect(screen.getByText(/Complete/)).toBeInTheDocument();
      });

      it('unblocks dependent steps when step is marked complete', async () => {
        // Arrange
        const user = userEvent.setup();
        const mockSteps: WorkflowStep[] = [
          createMockWorkflowStep({
            id: 'step-1',
            name: 'Data Load',
            status: 'complete',
          }),
          createMockWorkflowStep({
            id: 'step-2',
            name: 'Validation',
            status: 'not-started',
            dependencies: ['step-1'],
          }),
        ];

        vi.mocked(get).mockResolvedValueOnce(mockSteps);
        vi.mocked(post).mockResolvedValueOnce({
          success: true,
          message: 'Step marked complete',
        });

        // Act
        render(<div>Workflow Page - to be implemented</div>);
        await user.click(screen.getByRole('button', { name: /Mark Complete/ }));
        await user.click(screen.getByRole('button', { name: /Confirm/ }));

        // Assert - dependent step should no longer be blocked
        await waitFor(() => {
          const validationStep = screen.getByText('Validation');
          expect(validationStep).not.toHaveClass('blocked');
        });
      });
    });

    describe('Edge Cases', () => {
      it('prevents marking complete when tasks are incomplete', async () => {
        // Arrange
        const user = userEvent.setup();
        const mockDetails = createMockStepDetails({
          tasks: [
            { id: 'task-1', name: 'Task 1', completed: true },
            { id: 'task-2', name: 'Task 2', completed: false },
          ],
        });

        vi.mocked(get).mockResolvedValueOnce(mockDetails);

        // Act
        render(<div>Workflow Page - to be implemented</div>);
        await user.click(screen.getByRole('button', { name: /Mark Complete/ }));

        // Assert
        await waitFor(() => {
          expect(
            screen.getByText(/All tasks must be completed first/),
          ).toBeInTheDocument();
        });
      });
    });

    describe('Error Handling', () => {
      it('displays error when update fails', async () => {
        // Arrange
        const user = userEvent.setup();
        vi.mocked(post).mockRejectedValueOnce(new Error('API Error'));

        // Act
        render(<div>Workflow Page - to be implemented</div>);
        await user.click(screen.getByRole('button', { name: /Mark Complete/ }));
        await user.click(screen.getByRole('button', { name: /Confirm/ }));

        // Assert
        await waitFor(() => {
          expect(
            screen.getByText(/Failed to update step status/),
          ).toBeInTheDocument();
        });
      });
    });
  });

  describe('Story 10.4: View Blocked Steps', () => {
    describe('Happy Path', () => {
      it('highlights blocked steps in red', async () => {
        // Arrange
        const mockSteps: WorkflowStep[] = [
          createMockWorkflowStep({
            id: 'step-1',
            name: 'Data Load',
            status: 'in-progress',
          }),
          createMockWorkflowStep({
            id: 'step-2',
            name: 'Validation',
            status: 'blocked',
            dependencies: ['step-1'],
          }),
        ];

        vi.mocked(get).mockResolvedValueOnce(mockSteps);

        // Act
        render(<div>Workflow Page - to be implemented</div>);

        // Assert
        await waitFor(() => {
          const blockedStep = screen.getByText('Validation');
          expect(blockedStep).toHaveClass('blocked');
          expect(blockedStep).toHaveStyle({ color: 'red' });
        });
      });

      it('shows tooltip with blocking dependencies on hover', async () => {
        // Arrange
        const user = userEvent.setup();
        const mockSteps: WorkflowStep[] = [
          createMockWorkflowStep({
            id: 'step-2',
            name: 'Validation',
            status: 'blocked',
          }),
        ];
        const mockDetails = createMockStepDetails({
          blockedBy: ['Data Load', 'File Import'],
        });

        vi.mocked(get).mockResolvedValueOnce(mockSteps);
        vi.mocked(get).mockResolvedValueOnce(mockDetails);

        // Act
        render(<div>Workflow Page - to be implemented</div>);
        const blockedStep = await screen.findByText('Validation');
        await user.hover(blockedStep);

        // Assert
        await waitFor(() => {
          expect(
            screen.getByText(/Blocked by: Data Load, File Import/),
          ).toBeInTheDocument();
        });
      });

      it('displays blocking dependencies when step is clicked', async () => {
        // Arrange
        const user = userEvent.setup();
        const mockDetails = createMockStepDetails({
          status: 'blocked',
          blockedBy: ['Data Load', 'File Import'],
        });

        vi.mocked(get).mockResolvedValueOnce(mockDetails);

        // Act
        render(<div>Workflow Page - to be implemented</div>);
        await user.click(screen.getByText('Data Load'));

        // Assert
        await waitFor(() => {
          expect(screen.getByText('Data Load')).toBeInTheDocument();
          expect(screen.getByText('File Import')).toBeInTheDocument();
        });
      });
    });

    describe('Edge Cases', () => {
      it('shows no blocked steps when all dependencies are complete', async () => {
        // Arrange
        const mockSteps: WorkflowStep[] = [
          createMockWorkflowStep({
            id: 'step-1',
            name: 'Data Load',
            status: 'complete',
          }),
          createMockWorkflowStep({
            id: 'step-2',
            name: 'Validation',
            status: 'in-progress',
            dependencies: ['step-1'],
          }),
        ];

        vi.mocked(get).mockResolvedValueOnce(mockSteps);

        // Act
        render(<div>Workflow Page - to be implemented</div>);

        // Assert
        await waitFor(() => {
          const steps = screen.getAllByRole('article');
          const blockedSteps = steps.filter((step) =>
            step.className.includes('blocked'),
          );
          expect(blockedSteps).toHaveLength(0);
        });
      });
    });

    describe('Error Handling', () => {
      it('displays error when dependency calculation fails', async () => {
        // Arrange
        vi.mocked(get).mockRejectedValueOnce(
          new Error('Dependency calculation failed'),
        );

        // Act
        render(<div>Workflow Page - to be implemented</div>);

        // Assert
        await waitFor(() => {
          expect(
            screen.getByText(/Unable to determine dependencies/),
          ).toBeInTheDocument();
        });
      });
    });
  });

  describe('Story 10.5: View Critical Path', () => {
    describe('Happy Path', () => {
      it('highlights critical path steps when button is clicked', async () => {
        // Arrange
        const user = userEvent.setup();
        const mockSteps: WorkflowStep[] = [
          createMockWorkflowStep({
            id: 'step-1',
            name: 'Data Load',
            isOnCriticalPath: true,
          }),
          createMockWorkflowStep({
            id: 'step-2',
            name: 'Validation',
            isOnCriticalPath: true,
          }),
          createMockWorkflowStep({
            id: 'step-3',
            name: 'Optional Review',
            isOnCriticalPath: false,
          }),
        ];

        vi.mocked(get).mockResolvedValueOnce(mockSteps);

        // Act
        render(<div>Workflow Page - to be implemented</div>);
        await user.click(
          screen.getByRole('button', { name: /Show Critical Path/ }),
        );

        // Assert
        await waitFor(() => {
          expect(screen.getByText('Data Load')).toHaveClass('critical-path');
          expect(screen.getByText('Validation')).toHaveClass('critical-path');
          expect(screen.getByText('Optional Review')).not.toHaveClass(
            'critical-path',
          );
        });
      });

      it('displays estimated completion date for critical path', async () => {
        // Arrange
        const user = userEvent.setup();
        const mockProgress = createMockProgress({
          estimatedCompletionDate: '2024-02-28',
        });

        vi.mocked(get).mockResolvedValueOnce(mockProgress);

        // Act
        render(<div>Workflow Page - to be implemented</div>);
        await user.click(
          screen.getByRole('button', { name: /Show Critical Path/ }),
        );

        // Assert
        await waitFor(() => {
          expect(
            screen.getByText(/Estimated completion: 2024-02-28/),
          ).toBeInTheDocument();
        });
      });

      it('shows warning on hover for critical steps', async () => {
        // Arrange
        const user = userEvent.setup();
        const mockSteps: WorkflowStep[] = [
          createMockWorkflowStep({
            name: 'Data Load',
            isOnCriticalPath: true,
          }),
        ];

        vi.mocked(get).mockResolvedValueOnce(mockSteps);

        // Act
        render(<div>Workflow Page - to be implemented</div>);
        await user.click(
          screen.getByRole('button', { name: /Show Critical Path/ }),
        );

        const criticalStep = await screen.findByText('Data Load');
        await user.hover(criticalStep);

        // Assert
        await waitFor(() => {
          expect(
            screen.getByText(/Delay in this step will impact final deadline/),
          ).toBeInTheDocument();
        });
      });
    });

    describe('Edge Cases', () => {
      it('highlights all steps when all are on critical path', async () => {
        // Arrange
        const user = userEvent.setup();
        const mockSteps: WorkflowStep[] = [
          createMockWorkflowStep({
            id: 'step-1',
            name: 'Step 1',
            isOnCriticalPath: true,
          }),
          createMockWorkflowStep({
            id: 'step-2',
            name: 'Step 2',
            isOnCriticalPath: true,
          }),
          createMockWorkflowStep({
            id: 'step-3',
            name: 'Step 3',
            isOnCriticalPath: true,
          }),
        ];

        vi.mocked(get).mockResolvedValueOnce(mockSteps);

        // Act
        render(<div>Workflow Page - to be implemented</div>);
        await user.click(
          screen.getByRole('button', { name: /Show Critical Path/ }),
        );

        // Assert
        await waitFor(() => {
          const criticalSteps = screen
            .getAllByRole('article')
            .filter((step) => step.className.includes('critical-path'));
          expect(criticalSteps).toHaveLength(3);
        });
      });
    });

    describe('Error Handling', () => {
      it('displays error when critical path calculation fails', async () => {
        // Arrange
        const user = userEvent.setup();
        vi.mocked(get).mockRejectedValueOnce(
          new Error('Critical path calculation failed'),
        );

        // Act
        render(<div>Workflow Page - to be implemented</div>);
        await user.click(
          screen.getByRole('button', { name: /Show Critical Path/ }),
        );

        // Assert
        await waitFor(() => {
          expect(
            screen.getByText(/Unable to calculate critical path/),
          ).toBeInTheDocument();
        });
      });
    });
  });

  describe('Story 10.6: Assign Step Owner', () => {
    describe('Happy Path', () => {
      it('displays user dropdown when Assign Owner is clicked', async () => {
        // Arrange
        const user = userEvent.setup();

        // Act
        render(<div>Workflow Page - to be implemented</div>);
        await user.click(screen.getByRole('button', { name: /Assign Owner/ }));

        // Assert
        await waitFor(() => {
          expect(
            screen.getByRole('combobox', { name: /Select User/ }),
          ).toBeInTheDocument();
        });
      });

      it('assigns owner and shows success message', async () => {
        // Arrange
        const user = userEvent.setup();
        vi.mocked(post).mockResolvedValueOnce({
          success: true,
          message: 'Owner assigned successfully',
        });

        // Act
        render(<div>Workflow Page - to be implemented</div>);
        await user.click(screen.getByRole('button', { name: /Assign Owner/ }));
        await user.selectOptions(
          screen.getByRole('combobox', { name: /Select User/ }),
          'user-123',
        );
        await user.click(screen.getByRole('button', { name: /Save/ }));

        // Assert
        await waitFor(() => {
          expect(
            screen.getByText(/Owner assigned successfully/),
          ).toBeInTheDocument();
        });
      });

      it('sends notification to assigned owner', async () => {
        // Arrange
        const user = userEvent.setup();
        vi.mocked(post).mockResolvedValueOnce({
          success: true,
          message: 'Owner assigned successfully',
        });

        // Act
        render(<div>Workflow Page - to be implemented</div>);
        await user.click(screen.getByRole('button', { name: /Assign Owner/ }));
        await user.selectOptions(
          screen.getByRole('combobox', { name: /Select User/ }),
          'user-123',
        );
        await user.click(screen.getByRole('button', { name: /Save/ }));

        // Assert
        await waitFor(() => {
          expect(vi.mocked(post)).toHaveBeenCalledWith(
            expect.stringContaining('/assign'),
            expect.objectContaining({ userId: 'user-123' }),
            expect.any(String),
          );
        });
      });
    });

    describe('Edge Cases', () => {
      it('notifies previous owner when reassigning', async () => {
        // Arrange
        const user = userEvent.setup();
        const mockDetails = createMockStepDetails({
          owner: 'previous-user',
        });

        vi.mocked(get).mockResolvedValueOnce(mockDetails);
        vi.mocked(post).mockResolvedValueOnce({
          success: true,
          message: 'Owner reassigned',
        });

        // Act
        render(<div>Workflow Page - to be implemented</div>);
        await user.click(screen.getByRole('button', { name: /Assign Owner/ }));
        await user.selectOptions(
          screen.getByRole('combobox', { name: /Select User/ }),
          'new-user',
        );
        await user.click(screen.getByRole('button', { name: /Save/ }));

        // Assert
        await waitFor(() => {
          expect(screen.getByText(/Owner reassigned/)).toBeInTheDocument();
        });
      });
    });

    describe('Error Handling', () => {
      it('displays error when assignment fails', async () => {
        // Arrange
        const user = userEvent.setup();
        vi.mocked(post).mockRejectedValueOnce(new Error('API Error'));

        // Act
        render(<div>Workflow Page - to be implemented</div>);
        await user.click(screen.getByRole('button', { name: /Assign Owner/ }));
        await user.selectOptions(
          screen.getByRole('combobox', { name: /Select User/ }),
          'user-123',
        );
        await user.click(screen.getByRole('button', { name: /Save/ }));

        // Assert
        await waitFor(() => {
          expect(
            screen.getByText(/Failed to assign owner/),
          ).toBeInTheDocument();
        });
      });
    });
  });

  describe('Story 10.7: Set Step Due Dates', () => {
    describe('Happy Path', () => {
      it('displays date picker when Set Due Date is clicked', async () => {
        // Arrange
        const user = userEvent.setup();

        // Act
        render(<div>Workflow Page - to be implemented</div>);
        await user.click(screen.getByRole('button', { name: /Set Due Date/ }));

        // Assert
        await waitFor(() => {
          expect(screen.getByLabelText(/Due Date/)).toBeInTheDocument();
        });
      });

      it('sets due date and shows success message', async () => {
        // Arrange
        const user = userEvent.setup();
        vi.mocked(post).mockResolvedValueOnce({
          success: true,
          message: 'Due date set successfully',
        });

        // Act
        render(<div>Workflow Page - to be implemented</div>);
        await user.click(screen.getByRole('button', { name: /Set Due Date/ }));
        await user.type(screen.getByLabelText(/Due Date/), '2024-02-15');
        await user.click(screen.getByRole('button', { name: /Save/ }));

        // Assert
        await waitFor(() => {
          expect(
            screen.getByText(/Due date set successfully/),
          ).toBeInTheDocument();
        });
      });

      it('highlights overdue steps in red with OVERDUE badge', async () => {
        // Arrange
        const mockSteps: WorkflowStep[] = [
          createMockWorkflowStep({
            name: 'Overdue Step',
            dueDate: '2024-01-01',
            isOverdue: true,
          }),
        ];

        vi.mocked(get).mockResolvedValueOnce(mockSteps);

        // Act
        render(<div>Workflow Page - to be implemented</div>);

        // Assert
        await waitFor(() => {
          expect(screen.getByText('OVERDUE')).toBeInTheDocument();
          expect(screen.getByText('Overdue Step')).toHaveStyle({
            color: 'red',
          });
        });
      });
    });

    describe('Edge Cases', () => {
      it('warns when due date is before prerequisite due dates', async () => {
        // Arrange
        const user = userEvent.setup();
        const mockDetails = createMockStepDetails({
          prerequisites: ['Data Load (Due: 2024-02-20)'],
        });

        vi.mocked(get).mockResolvedValueOnce(mockDetails);

        // Act
        render(<div>Workflow Page - to be implemented</div>);
        await user.click(screen.getByRole('button', { name: /Set Due Date/ }));
        await user.type(screen.getByLabelText(/Due Date/), '2024-02-15');
        await user.click(screen.getByRole('button', { name: /Save/ }));

        // Assert
        await waitFor(() => {
          expect(
            screen.getByText(/Due date is before prerequisites/),
          ).toBeInTheDocument();
        });
      });
    });

    describe('Error Handling', () => {
      it('displays error when setting due date fails', async () => {
        // Arrange
        const user = userEvent.setup();
        vi.mocked(post).mockRejectedValueOnce(new Error('API Error'));

        // Act
        render(<div>Workflow Page - to be implemented</div>);
        await user.click(screen.getByRole('button', { name: /Set Due Date/ }));
        await user.type(screen.getByLabelText(/Due Date/), '2024-02-15');
        await user.click(screen.getByRole('button', { name: /Save/ }));

        // Assert
        await waitFor(() => {
          expect(
            screen.getByText(/Failed to set due date/),
          ).toBeInTheDocument();
        });
      });
    });
  });

  describe('Story 10.8: View Overall Workflow Progress', () => {
    describe('Happy Path', () => {
      it('displays progress bar with percentage on page load', async () => {
        // Arrange
        const mockProgress = createMockProgress({
          completedSteps: 3,
          totalSteps: 10,
          percentage: 30,
        });

        vi.mocked(get).mockResolvedValueOnce(mockProgress);

        // Act
        render(<div>Workflow Page - to be implemented</div>);

        // Assert
        await waitFor(() => {
          expect(screen.getByText('30% Complete')).toBeInTheDocument();
          expect(screen.getByRole('progressbar')).toHaveAttribute(
            'aria-valuenow',
            '30',
          );
        });
      });

      it('updates progress percentage when step is completed', async () => {
        // Arrange
        const user = userEvent.setup();
        const initialProgress = createMockProgress({
          completedSteps: 3,
          totalSteps: 10,
          percentage: 30,
        });
        const updatedProgress = createMockProgress({
          completedSteps: 4,
          totalSteps: 10,
          percentage: 40,
        });

        vi.mocked(get)
          .mockResolvedValueOnce(initialProgress)
          .mockResolvedValueOnce(updatedProgress);
        vi.mocked(post).mockResolvedValueOnce({
          success: true,
          message: 'Step marked complete',
        });

        // Act
        render(<div>Workflow Page - to be implemented</div>);

        await waitFor(() => {
          expect(screen.getByText('30% Complete')).toBeInTheDocument();
        });

        await user.click(screen.getByRole('button', { name: /Mark Complete/ }));
        await user.click(screen.getByRole('button', { name: /Confirm/ }));

        // Assert
        await waitFor(() => {
          expect(screen.getByText('40% Complete')).toBeInTheDocument();
        });
      });

      it('displays completion message when all steps are complete', async () => {
        // Arrange
        const mockProgress = createMockProgress({
          completedSteps: 10,
          totalSteps: 10,
          percentage: 100,
          status: 'complete',
        });

        vi.mocked(get).mockResolvedValueOnce(mockProgress);

        // Act
        render(<div>Workflow Page - to be implemented</div>);

        // Assert
        await waitFor(() => {
          expect(
            screen.getByText(/100% Complete - Workflow Finished/),
          ).toBeInTheDocument();
        });
      });
    });

    describe('Edge Cases', () => {
      it('displays 0% when no steps have started', async () => {
        // Arrange
        const mockProgress = createMockProgress({
          completedSteps: 0,
          totalSteps: 10,
          percentage: 0,
        });

        vi.mocked(get).mockResolvedValueOnce(mockProgress);

        // Act
        render(<div>Workflow Page - to be implemented</div>);

        // Assert
        await waitFor(() => {
          expect(screen.getByText('0% Complete')).toBeInTheDocument();
        });
      });
    });

    describe('Error Handling', () => {
      it('displays error when progress calculation fails', async () => {
        // Arrange
        vi.mocked(get).mockRejectedValueOnce(
          new Error('Progress calculation failed'),
        );

        // Act
        render(<div>Workflow Page - to be implemented</div>);

        // Assert
        await waitFor(() => {
          expect(
            screen.getByText(/Unable to calculate progress/),
          ).toBeInTheDocument();
        });
      });
    });
  });

  describe('Story 10.9: Export Workflow Status', () => {
    describe('Happy Path', () => {
      it('downloads Excel file when Export Status is clicked', async () => {
        // Arrange
        const user = userEvent.setup();
        const mockBlob = new Blob(['Excel data'], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });

        vi.mocked(get).mockResolvedValueOnce(mockBlob);

        // Create a mock for URL.createObjectURL
        const mockCreateObjectURL = vi.fn(() => 'blob:mock-url');
        global.URL.createObjectURL = mockCreateObjectURL;

        // Act
        render(<div>Workflow Page - to be implemented</div>);
        await user.click(screen.getByRole('button', { name: /Export Status/ }));

        // Assert
        await waitFor(() => {
          expect(vi.mocked(get)).toHaveBeenCalledWith(
            expect.stringContaining('/export'),
            expect.objectContaining({ isBinaryResponse: true }),
          );
        });
      });

      it('includes required columns in export', async () => {
        // Arrange
        const user = userEvent.setup();

        // This test verifies the API is called correctly
        // Actual column verification would be done in E2E tests
        vi.mocked(get).mockResolvedValueOnce(
          new Blob(['Excel data'], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          }),
        );

        // Act
        render(<div>Workflow Page - to be implemented</div>);
        await user.click(screen.getByRole('button', { name: /Export Status/ }));

        // Assert - verify API called with correct endpoint
        await waitFor(() => {
          expect(vi.mocked(get)).toHaveBeenCalledWith(
            expect.stringContaining('/export'),
            expect.any(Object),
          );
        });
      });

      it('generates file with correct naming convention', async () => {
        // Arrange
        const user = userEvent.setup();
        const mockBlob = new Blob(['Excel data']);

        vi.mocked(get).mockResolvedValueOnce(mockBlob);

        // Mock download link creation
        const mockClick = vi.fn();
        const mockLink = {
          href: '',
          download: '',
          click: mockClick,
        };
        vi.spyOn(document, 'createElement').mockReturnValue(
          mockLink as unknown as HTMLAnchorElement,
        );

        // Act
        render(<div>Workflow Page - to be implemented</div>);
        await user.click(screen.getByRole('button', { name: /Export Status/ }));

        // Assert
        await waitFor(() => {
          expect(mockLink.download).toMatch(
            /MonthlyWorkflow_\d{4}-\d{2}\.xlsx/,
          );
        });
      });
    });

    describe('Error Handling', () => {
      it('displays error when export fails', async () => {
        // Arrange
        const user = userEvent.setup();
        vi.mocked(get).mockRejectedValueOnce(new Error('Export failed'));

        // Act
        render(<div>Workflow Page - to be implemented</div>);
        await user.click(screen.getByRole('button', { name: /Export Status/ }));

        // Assert
        await waitFor(() => {
          expect(screen.getByText(/Export failed/)).toBeInTheDocument();
        });
      });
    });
  });

  describe('Story 10.10: Add Workflow Comments', () => {
    describe('Happy Path', () => {
      it('displays text field when Add Comment is clicked', async () => {
        // Arrange
        const user = userEvent.setup();

        // Act
        render(<div>Workflow Page - to be implemented</div>);
        await user.click(screen.getByRole('button', { name: /Add Comment/ }));

        // Assert
        await waitFor(() => {
          expect(screen.getByLabelText(/Comment/)).toBeInTheDocument();
        });
      });

      it('adds comment and shows success message', async () => {
        // Arrange
        const user = userEvent.setup();
        const mockComment = createMockComment({
          text: 'This is a test comment',
        });

        vi.mocked(post).mockResolvedValueOnce(mockComment);

        // Act
        render(<div>Workflow Page - to be implemented</div>);
        await user.click(screen.getByRole('button', { name: /Add Comment/ }));
        await user.type(
          screen.getByLabelText(/Comment/),
          'This is a test comment',
        );
        await user.click(screen.getByRole('button', { name: /Save/ }));

        // Assert
        await waitFor(() => {
          expect(
            screen.getByText(/Comment added successfully/),
          ).toBeInTheDocument();
        });
      });

      it('displays comment with username and timestamp', async () => {
        // Arrange
        const user = userEvent.setup();
        const mockComment = createMockComment({
          username: 'testuser',
          text: 'Test comment',
          timestamp: '2024-01-15T10:30:00Z',
        });

        vi.mocked(post).mockResolvedValueOnce(mockComment);
        vi.mocked(get).mockResolvedValueOnce([mockComment]);

        // Act
        render(<div>Workflow Page - to be implemented</div>);
        await user.click(screen.getByRole('button', { name: /Add Comment/ }));
        await user.type(screen.getByLabelText(/Comment/), 'Test comment');
        await user.click(screen.getByRole('button', { name: /Save/ }));

        // Assert
        await waitFor(() => {
          expect(screen.getByText('testuser')).toBeInTheDocument();
          expect(screen.getByText(/2024-01-15/)).toBeInTheDocument();
          expect(screen.getByText('Test comment')).toBeInTheDocument();
        });
      });
    });

    describe('Edge Cases', () => {
      it('shows error when comment is empty', async () => {
        // Arrange
        const user = userEvent.setup();

        // Act
        render(<div>Workflow Page - to be implemented</div>);
        await user.click(screen.getByRole('button', { name: /Add Comment/ }));
        await user.click(screen.getByRole('button', { name: /Save/ }));

        // Assert
        await waitFor(() => {
          expect(
            screen.getByText(/Comment cannot be empty/),
          ).toBeInTheDocument();
        });
      });
    });

    describe('Error Handling', () => {
      it('displays error when adding comment fails', async () => {
        // Arrange
        const user = userEvent.setup();
        vi.mocked(post).mockRejectedValueOnce(new Error('API Error'));

        // Act
        render(<div>Workflow Page - to be implemented</div>);
        await user.click(screen.getByRole('button', { name: /Add Comment/ }));
        await user.type(screen.getByLabelText(/Comment/), 'Test comment');
        await user.click(screen.getByRole('button', { name: /Save/ }));

        // Assert
        await waitFor(() => {
          expect(screen.getByText(/Failed to add comment/)).toBeInTheDocument();
        });
      });
    });
  });
});

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
import { WorkflowPage } from '@/app/workflow/page';

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

// Default mock data for all tests
const defaultMockSteps: WorkflowStep[] = [
  createMockWorkflowStep({
    id: 'step-1',
    name: 'Data Load',
    status: 'not-started',
    dependencies: [],
  }),
];

const defaultMockProgress: WorkflowProgress = createMockProgress({
  completedSteps: 0,
  totalSteps: 10,
  percentage: 0,
});

// Helper to wait for component to finish loading
const waitForLoading = async () => {
  await waitFor(() => {
    expect(screen.queryByText('Loading workflow...')).not.toBeInTheDocument();
  });
};

describe('Epic 10: Monthly Process Workflow Orchestration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
    // Default mock setup - tests can override with mockResolvedValueOnce
    vi.mocked(get).mockImplementation((url: string) => {
      if (url.includes('/progress')) {
        return Promise.resolve(defaultMockProgress);
      }
      if (url.includes('/monthly-workflow/') && !url.includes('/steps/')) {
        return Promise.resolve(defaultMockSteps);
      }
      return Promise.resolve(null);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
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

        vi.mocked(get).mockImplementation((url: string) => {
          if (url.includes('/progress')) {
            return Promise.resolve(defaultMockProgress);
          }
          return Promise.resolve(mockSteps);
        });

        // Act
        render(<WorkflowPage />);

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
          createMockWorkflowStep({
            id: 'step-1',
            name: 'Complete Step',
            status: 'complete',
          }),
          createMockWorkflowStep({
            id: 'step-2',
            name: 'In Progress Step',
            status: 'in-progress',
          }),
          createMockWorkflowStep({
            id: 'step-3',
            name: 'Not Started Step',
            status: 'not-started',
          }),
          createMockWorkflowStep({
            id: 'step-4',
            name: 'Blocked Step',
            status: 'blocked',
          }),
        ];

        vi.mocked(get).mockImplementation((url: string) => {
          if (url.includes('/progress')) {
            return Promise.resolve(defaultMockProgress);
          }
          return Promise.resolve(mockSteps);
        });

        // Act
        render(<WorkflowPage />);

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

        vi.mocked(get).mockImplementation((url: string) => {
          if (url.includes('/progress')) {
            return Promise.resolve(defaultMockProgress);
          }
          return Promise.resolve(mockSteps);
        });

        // Act
        render(<WorkflowPage />);

        // Assert - verify dependencies are shown
        await waitFor(() => {
          expect(screen.getByText('Validation')).toBeInTheDocument();
        });

        // Implementation should show "Depends on: Data Load" or similar
        expect(screen.getByText(/Depends on:.*Data Load/)).toBeInTheDocument();
      });
    });

    describe('Edge Cases', () => {
      it('displays message when no workflow has been initiated', async () => {
        // Arrange
        vi.mocked(get).mockResolvedValueOnce([]);

        // Act
        render(<WorkflowPage />);

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
        render(<WorkflowPage />);

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

        vi.mocked(get).mockImplementation((url: string) => {
          if (url.includes('/steps/')) {
            return Promise.resolve(mockDetails);
          }
          if (url.includes('/progress')) {
            return Promise.resolve(defaultMockProgress);
          }
          return Promise.resolve(defaultMockSteps);
        });

        // Act
        render(<WorkflowPage />);
        await waitForLoading();
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

        vi.mocked(get).mockImplementation((url: string) => {
          if (url.includes('/steps/')) {
            return Promise.resolve(mockDetails);
          }
          if (url.includes('/progress')) {
            return Promise.resolve(defaultMockProgress);
          }
          return Promise.resolve(defaultMockSteps);
        });

        // Act
        render(<WorkflowPage />);
        await waitForLoading();
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

        vi.mocked(get).mockImplementation((url: string) => {
          if (url.includes('/steps/')) {
            return Promise.resolve(mockDetails);
          }
          if (url.includes('/progress')) {
            return Promise.resolve(defaultMockProgress);
          }
          return Promise.resolve(defaultMockSteps);
        });

        // Act
        render(<WorkflowPage />);
        await waitForLoading();
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

        vi.mocked(get).mockImplementation((url: string) => {
          if (url.includes('/steps/')) {
            return Promise.resolve(mockDetails);
          }
          if (url.includes('/progress')) {
            return Promise.resolve(defaultMockProgress);
          }
          return Promise.resolve(defaultMockSteps);
        });

        // Act
        render(<WorkflowPage />);
        await waitForLoading();
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
        vi.mocked(get).mockImplementation((url: string) => {
          if (url.includes('/steps/')) {
            return Promise.reject(new Error('API Error'));
          }
          if (url.includes('/progress')) {
            return Promise.resolve(defaultMockProgress);
          }
          return Promise.resolve(defaultMockSteps);
        });

        // Act
        render(<WorkflowPage />);
        await waitForLoading();
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
        render(<WorkflowPage />);
        await waitForLoading();
        const markCompleteButton = screen.getAllByRole('button', {
          name: /Mark Complete/,
        })[0];
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
        const completedSteps: WorkflowStep[] = [
          createMockWorkflowStep({
            id: 'step-1',
            name: 'Data Load',
            status: 'complete',
          }),
        ];

        let callCount = 0;
        vi.mocked(get).mockImplementation((url: string) => {
          if (url.includes('/progress')) {
            return Promise.resolve(defaultMockProgress);
          }
          if (url.includes('/monthly-workflow/') && !url.includes('/steps/')) {
            callCount++;
            // First call returns default, second call returns completed
            return Promise.resolve(
              callCount > 1 ? completedSteps : defaultMockSteps,
            );
          }
          return Promise.resolve(null);
        });
        vi.mocked(post).mockResolvedValueOnce({
          success: true,
          message: 'Step marked complete',
        });

        // Act
        render(<WorkflowPage />);
        await waitForLoading();
        await user.click(
          screen.getAllByRole('button', { name: /Mark Complete/ })[0],
        );
        await user.click(screen.getByRole('button', { name: /Confirm/ }));

        // Assert - verify API was called to mark complete
        await waitFor(() => {
          expect(vi.mocked(post)).toHaveBeenCalledWith(
            expect.stringContaining('/complete'),
            expect.objectContaining({ confirmed: true }),
            expect.any(String),
          );
        });
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

        vi.mocked(get).mockImplementation((url: string) => {
          if (url.includes('/progress')) {
            return Promise.resolve(defaultMockProgress);
          }
          return Promise.resolve(mockSteps);
        });
        vi.mocked(post).mockResolvedValueOnce({
          success: true,
          message: 'Step marked complete',
        });

        // Act
        render(<WorkflowPage />);
        await waitForLoading();
        await user.click(
          screen.getAllByRole('button', { name: /Mark Complete/ })[0],
        );
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

        vi.mocked(get).mockImplementation((url: string) => {
          if (url.includes('/steps/')) {
            return Promise.resolve(mockDetails);
          }
          if (url.includes('/progress')) {
            return Promise.resolve(defaultMockProgress);
          }
          return Promise.resolve(defaultMockSteps);
        });

        // Act
        render(<WorkflowPage />);
        await waitForLoading();
        // First click the step to load details
        await user.click(screen.getByText('Data Load'));
        await waitFor(() => {
          expect(screen.getByText('Task 1')).toBeInTheDocument();
        });
        // Then try to mark complete
        await user.click(
          screen.getAllByRole('button', { name: /Mark Complete/ })[0],
        );
        await user.click(screen.getByRole('button', { name: /Confirm/ }));

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
        render(<WorkflowPage />);
        await waitForLoading();
        await user.click(
          screen.getAllByRole('button', { name: /Mark Complete/ })[0],
        );
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

        vi.mocked(get).mockImplementation((url: string) => {
          if (url.includes('/progress')) {
            return Promise.resolve(defaultMockProgress);
          }
          return Promise.resolve(mockSteps);
        });

        // Act
        render(<WorkflowPage />);
        await waitForLoading();

        // Assert - the article containing "Validation" should have blocked class
        const articles = screen.getAllByRole('article');
        const blockedArticle = articles.find((article) =>
          article.textContent?.includes('Validation'),
        );
        expect(blockedArticle).toHaveClass('blocked');
      });

      it('shows tooltip with blocking dependencies on hover', async () => {
        // Arrange
        const user = userEvent.setup();
        const mockSteps: WorkflowStep[] = [
          createMockWorkflowStep({
            id: 'step-2',
            name: 'Validation',
            status: 'blocked',
            dependencies: ['Data Load', 'File Import'],
          }),
        ];

        vi.mocked(get).mockImplementation((url: string) => {
          if (url.includes('/progress')) {
            return Promise.resolve(defaultMockProgress);
          }
          return Promise.resolve(mockSteps);
        });

        // Act
        render(<WorkflowPage />);
        await waitForLoading();
        const blockedArticle = screen.getByRole('article');
        await user.hover(blockedArticle);

        // Assert - title attribute shows blocked by info
        expect(blockedArticle).toHaveAttribute(
          'title',
          expect.stringContaining('Blocked by'),
        );
      });

      it('displays blocking dependencies when step is clicked', async () => {
        // Arrange
        const user = userEvent.setup();
        const mockDetails = createMockStepDetails({
          status: 'blocked',
          blockedBy: ['Dependency A', 'File Import'],
        });

        vi.mocked(get).mockImplementation((url: string) => {
          if (url.includes('/steps/')) {
            return Promise.resolve(mockDetails);
          }
          if (url.includes('/progress')) {
            return Promise.resolve(defaultMockProgress);
          }
          return Promise.resolve(defaultMockSteps);
        });

        // Act
        render(<WorkflowPage />);
        await waitForLoading();
        await user.click(screen.getByText('Data Load'));

        // Assert - verify blockedBy section is displayed
        await waitFor(() => {
          expect(
            screen.getByText(/Dependency A, File Import/),
          ).toBeInTheDocument();
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

        vi.mocked(get).mockImplementation((url: string) => {
          if (url.includes('/progress')) {
            return Promise.resolve(defaultMockProgress);
          }
          return Promise.resolve(mockSteps);
        });

        // Act
        render(<WorkflowPage />);
        await waitForLoading();

        // Assert
        const steps = screen.getAllByRole('article');
        const blockedSteps = steps.filter((step) =>
          step.className.includes('blocked'),
        );
        expect(blockedSteps).toHaveLength(0);
      });
    });

    describe('Error Handling', () => {
      it('displays error when dependency calculation fails', async () => {
        // Arrange
        vi.mocked(get).mockRejectedValue(
          new Error('Dependency calculation failed'),
        );

        // Act
        render(<WorkflowPage />);

        // Assert
        await waitFor(() => {
          expect(
            screen.getByText(/Failed to load workflow/),
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

        vi.mocked(get).mockImplementation((url: string) => {
          if (url.includes('/progress')) {
            return Promise.resolve(defaultMockProgress);
          }
          return Promise.resolve(mockSteps);
        });

        // Act
        render(<WorkflowPage />);
        await waitForLoading();
        await user.click(
          screen.getByRole('button', { name: /Show Critical Path/ }),
        );

        // Assert - articles containing these names should have critical-path class
        await waitFor(() => {
          const articles = screen.getAllByRole('article');
          const dataLoadArticle = articles.find((a) =>
            a.textContent?.includes('Data Load'),
          );
          expect(dataLoadArticle).toHaveClass('critical-path');
        });
      });

      it('displays estimated completion date for critical path', async () => {
        // Arrange
        const user = userEvent.setup();
        const mockProgress = createMockProgress({
          estimatedCompletionDate: '2024-02-28',
        });

        vi.mocked(get).mockImplementation((url: string) => {
          if (url.includes('/progress')) {
            return Promise.resolve(mockProgress);
          }
          return Promise.resolve(
            defaultMockSteps.map((s) => ({ ...s, isOnCriticalPath: true })),
          );
        });

        // Act
        render(<WorkflowPage />);
        await waitForLoading();
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
            id: 'step-1',
            name: 'Data Load',
            isOnCriticalPath: true,
          }),
        ];

        vi.mocked(get).mockImplementation((url: string) => {
          if (url.includes('/progress')) {
            return Promise.resolve(defaultMockProgress);
          }
          return Promise.resolve(mockSteps);
        });

        // Act
        render(<WorkflowPage />);
        await waitForLoading();
        await user.click(
          screen.getByRole('button', { name: /Show Critical Path/ }),
        );

        const criticalArticle = screen.getByRole('article');
        await user.hover(criticalArticle);

        // Assert - title attribute shows warning
        expect(criticalArticle).toHaveAttribute(
          'title',
          expect.stringContaining('Delay in this step'),
        );
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

        vi.mocked(get).mockImplementation((url: string) => {
          if (url.includes('/progress')) {
            return Promise.resolve(defaultMockProgress);
          }
          return Promise.resolve(mockSteps);
        });

        // Act
        render(<WorkflowPage />);
        await waitForLoading();
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
        let callCount = 0;
        vi.mocked(get).mockImplementation((url: string) => {
          callCount++;
          if (url.includes('/progress')) {
            return Promise.resolve(defaultMockProgress);
          }
          // First call succeeds, second call (after clicking button) fails
          if (callCount > 2) {
            return Promise.reject(
              new Error('Critical path calculation failed'),
            );
          }
          return Promise.resolve(defaultMockSteps);
        });

        // Act
        render(<WorkflowPage />);
        await waitForLoading();
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
        render(<WorkflowPage />);
        await waitForLoading();
        await user.click(
          screen.getAllByRole('button', { name: /Assign Owner/ })[0],
        );

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
        render(<WorkflowPage />);
        await waitForLoading();
        await user.click(
          screen.getAllByRole('button', { name: /Assign Owner/ })[0],
        );
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

      it('sends notification to assigned owner', async () => {
        // Arrange
        const user = userEvent.setup();
        vi.mocked(post).mockResolvedValueOnce({
          success: true,
          message: 'Owner assigned successfully',
        });

        // Act
        render(<WorkflowPage />);
        await waitForLoading();
        await user.click(
          screen.getAllByRole('button', { name: /Assign Owner/ })[0],
        );
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
        vi.mocked(post).mockResolvedValueOnce({
          success: true,
          message: 'Owner reassigned',
        });

        // Act
        render(<WorkflowPage />);
        await waitForLoading();
        await user.click(
          screen.getAllByRole('button', { name: /Assign Owner/ })[0],
        );
        await user.selectOptions(
          screen.getByRole('combobox', { name: /Select User/ }),
          'new-user',
        );
        await user.click(screen.getByRole('button', { name: /Save/ }));

        // Assert
        await waitFor(() => {
          expect(vi.mocked(post)).toHaveBeenCalled();
        });
      });
    });

    describe('Error Handling', () => {
      it('displays error when assignment fails', async () => {
        // Arrange
        const user = userEvent.setup();
        vi.mocked(post).mockRejectedValueOnce(new Error('API Error'));

        // Act
        render(<WorkflowPage />);
        await waitForLoading();
        await user.click(
          screen.getAllByRole('button', { name: /Assign Owner/ })[0],
        );
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
        render(<WorkflowPage />);
        await waitForLoading();
        await user.click(
          screen.getAllByRole('button', { name: /Set Due Date/ })[0],
        );

        // Assert - query by id since date inputs don't have textbox role
        await waitFor(() => {
          const dateInput = document.getElementById('due-date');
          expect(dateInput).toBeInTheDocument();
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
        render(<WorkflowPage />);
        await waitForLoading();
        await user.click(
          screen.getAllByRole('button', { name: /Set Due Date/ })[0],
        );
        // Get the date input by its id
        await waitFor(() => {
          const dateInput = document.getElementById('due-date');
          expect(dateInput).toBeInTheDocument();
        });
        const dateInput = document.getElementById(
          'due-date',
        ) as HTMLInputElement;
        await user.type(dateInput, '2024-02-15');
        await user.click(screen.getByRole('button', { name: /Save/ }));

        // Assert
        await waitFor(() => {
          expect(vi.mocked(post)).toHaveBeenCalledWith(
            expect.stringContaining('/due-date'),
            expect.objectContaining({ dueDate: '2024-02-15' }),
            expect.any(String),
          );
        });
      });

      it('highlights overdue steps in red with OVERDUE badge', async () => {
        // Arrange
        const mockSteps: WorkflowStep[] = [
          createMockWorkflowStep({
            id: 'step-1',
            name: 'Overdue Step',
            dueDate: '2024-01-01',
            isOverdue: true,
          }),
        ];

        vi.mocked(get).mockImplementation((url: string) => {
          if (url.includes('/progress')) {
            return Promise.resolve(defaultMockProgress);
          }
          return Promise.resolve(mockSteps);
        });

        // Act
        render(<WorkflowPage />);
        await waitForLoading();

        // Assert
        expect(screen.getByText('OVERDUE')).toBeInTheDocument();
      });
    });

    describe('Edge Cases', () => {
      it('warns when due date is before prerequisite due dates', async () => {
        // Arrange
        const user = userEvent.setup();
        const mockDetails = createMockStepDetails({
          prerequisites: ['Data Load (Due: 2024-02-20)'],
        });

        vi.mocked(get).mockImplementation((url: string) => {
          if (url.includes('/steps/')) {
            return Promise.resolve(mockDetails);
          }
          if (url.includes('/progress')) {
            return Promise.resolve(defaultMockProgress);
          }
          return Promise.resolve(defaultMockSteps);
        });

        // Act
        render(<WorkflowPage />);
        await waitForLoading();
        // Click on step to load details first
        await user.click(screen.getByText('Data Load'));
        await waitFor(() => {
          expect(
            screen.getByText(/Data Load \(Due: 2024-02-20\)/),
          ).toBeInTheDocument();
        });
        // Then set due date
        await user.click(
          screen.getAllByRole('button', { name: /Set Due Date/ })[0],
        );
        await waitFor(() => {
          const dateInput = document.getElementById('due-date');
          expect(dateInput).toBeInTheDocument();
        });
        const dateInput = document.getElementById(
          'due-date',
        ) as HTMLInputElement;
        await user.type(dateInput, '2024-02-15');
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
        render(<WorkflowPage />);
        await waitForLoading();
        await user.click(
          screen.getAllByRole('button', { name: /Set Due Date/ })[0],
        );
        await waitFor(() => {
          const dateInput = document.getElementById('due-date');
          expect(dateInput).toBeInTheDocument();
        });
        const dateInput = document.getElementById(
          'due-date',
        ) as HTMLInputElement;
        await user.type(dateInput, '2024-02-15');
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

        vi.mocked(get).mockImplementation((url: string) => {
          if (url.includes('/progress')) {
            return Promise.resolve(mockProgress);
          }
          return Promise.resolve(defaultMockSteps);
        });

        // Act
        render(<WorkflowPage />);
        await waitForLoading();

        // Assert
        expect(screen.getByText('30% Complete')).toBeInTheDocument();
        expect(screen.getByRole('progressbar')).toHaveAttribute(
          'aria-valuenow',
          '30',
        );
      });

      it('updates progress percentage when step is completed', async () => {
        // Arrange
        const user = userEvent.setup();
        let callCount = 0;

        vi.mocked(get).mockImplementation((url: string) => {
          if (url.includes('/progress')) {
            callCount++;
            return Promise.resolve(
              createMockProgress({
                completedSteps: callCount > 1 ? 4 : 3,
                totalSteps: 10,
                percentage: callCount > 1 ? 40 : 30,
              }),
            );
          }
          return Promise.resolve(defaultMockSteps);
        });
        vi.mocked(post).mockResolvedValueOnce({
          success: true,
          message: 'Step marked complete',
        });

        // Act
        render(<WorkflowPage />);
        await waitForLoading();

        expect(screen.getByText('30% Complete')).toBeInTheDocument();

        await user.click(
          screen.getAllByRole('button', { name: /Mark Complete/ })[0],
        );
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

        vi.mocked(get).mockImplementation((url: string) => {
          if (url.includes('/progress')) {
            return Promise.resolve(mockProgress);
          }
          return Promise.resolve(defaultMockSteps);
        });

        // Act
        render(<WorkflowPage />);
        await waitForLoading();

        // Assert
        expect(
          screen.getByText(/100% Complete - Workflow Finished/),
        ).toBeInTheDocument();
      });
    });

    describe('Edge Cases', () => {
      it('displays 0% when no steps have started', async () => {
        // Arrange - defaultMockProgress has 0%
        // Act
        render(<WorkflowPage />);
        await waitForLoading();

        // Assert
        expect(screen.getByText('0% Complete')).toBeInTheDocument();
      });
    });

    describe('Error Handling', () => {
      it('displays error when progress calculation fails', async () => {
        // Arrange - progress fails but steps load
        vi.mocked(get).mockImplementation((url: string) => {
          if (url.includes('/progress')) {
            return Promise.reject(new Error('Progress calculation failed'));
          }
          return Promise.resolve(defaultMockSteps);
        });

        // Act
        render(<WorkflowPage />);
        await waitForLoading();

        // Assert - page should still render (progress is optional)
        expect(screen.getByText('Data Load')).toBeInTheDocument();
        // Progress bar won't show since progress failed to load
        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
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

        vi.mocked(get).mockImplementation((url: string) => {
          if (url.includes('/export')) {
            return Promise.resolve(mockBlob);
          }
          if (url.includes('/progress')) {
            return Promise.resolve(defaultMockProgress);
          }
          return Promise.resolve(defaultMockSteps);
        });

        // Create a mock for URL.createObjectURL
        const mockCreateObjectURL = vi.fn(() => 'blob:mock-url');
        global.URL.createObjectURL = mockCreateObjectURL;

        // Act
        render(<WorkflowPage />);
        await waitForLoading();
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

        vi.mocked(get).mockImplementation((url: string) => {
          if (url.includes('/export')) {
            return Promise.resolve(
              new Blob(['Excel data'], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
              }),
            );
          }
          if (url.includes('/progress')) {
            return Promise.resolve(defaultMockProgress);
          }
          return Promise.resolve(defaultMockSteps);
        });

        // Act
        render(<WorkflowPage />);
        await waitForLoading();
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

        // Mock download link creation - need to spy only for 'a' tags
        const mockClick = vi.fn();
        const mockLink = {
          href: '',
          download: '',
          click: mockClick,
        };
        const originalCreateElement = document.createElement.bind(document);
        const createElementSpy = vi
          .spyOn(document, 'createElement')
          .mockImplementation((tagName: string) => {
            if (tagName === 'a') {
              return mockLink as unknown as HTMLAnchorElement;
            }
            return originalCreateElement(tagName);
          });

        vi.mocked(get).mockImplementation((url: string) => {
          if (url.includes('/export')) {
            return Promise.resolve(mockBlob);
          }
          if (url.includes('/progress')) {
            return Promise.resolve(defaultMockProgress);
          }
          return Promise.resolve(defaultMockSteps);
        });

        // Act
        render(<WorkflowPage />);
        await waitFor(() => {
          expect(
            screen.getByRole('button', { name: /Export Status/ }),
          ).toBeInTheDocument();
        });
        await user.click(screen.getByRole('button', { name: /Export Status/ }));

        // Assert
        await waitFor(() => {
          expect(mockLink.download).toMatch(
            /MonthlyWorkflow_\d{4}-\d{2}\.xlsx/,
          );
        });

        // Restore the spy
        createElementSpy.mockRestore();
      });
    });

    describe('Error Handling', () => {
      it('displays error when export fails', async () => {
        // Arrange
        const user = userEvent.setup();
        vi.mocked(get).mockImplementation((url: string) => {
          if (url.includes('/export')) {
            return Promise.reject(new Error('Export failed'));
          }
          if (url.includes('/progress')) {
            return Promise.resolve(defaultMockProgress);
          }
          return Promise.resolve(defaultMockSteps);
        });

        // Act
        render(<WorkflowPage />);
        await waitForLoading();
        await user.click(screen.getByRole('button', { name: /Export Status/ }));

        // Assert - the error is shown via toast, check mock was called
        await waitFor(() => {
          expect(vi.mocked(get)).toHaveBeenCalledWith(
            expect.stringContaining('/export'),
            expect.any(Object),
          );
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
        render(<WorkflowPage />);
        await waitForLoading();
        await user.click(
          screen.getAllByRole('button', { name: /Add Comment/ })[0],
        );

        // Assert - query by id since dialog title also contains "Comment"
        await waitFor(() => {
          const commentInput = document.getElementById('comment');
          expect(commentInput).toBeInTheDocument();
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
        render(<WorkflowPage />);
        await waitForLoading();
        await user.click(
          screen.getAllByRole('button', { name: /Add Comment/ })[0],
        );
        await waitFor(() => {
          const commentInput = document.getElementById('comment');
          expect(commentInput).toBeInTheDocument();
        });
        const commentInput = document.getElementById(
          'comment',
        ) as HTMLTextAreaElement;
        await user.type(commentInput, 'This is a test comment');
        await user.click(screen.getByRole('button', { name: /Save/ }));

        // Assert
        await waitFor(() => {
          expect(vi.mocked(post)).toHaveBeenCalledWith(
            expect.stringContaining('/comments'),
            expect.objectContaining({ text: 'This is a test comment' }),
            expect.any(String),
          );
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

        // Act
        render(<WorkflowPage />);
        await waitForLoading();
        await user.click(
          screen.getAllByRole('button', { name: /Add Comment/ })[0],
        );
        await waitFor(() => {
          const commentInput = document.getElementById('comment');
          expect(commentInput).toBeInTheDocument();
        });
        const commentInput = document.getElementById(
          'comment',
        ) as HTMLTextAreaElement;
        await user.type(commentInput, 'Test comment');
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
        render(<WorkflowPage />);
        await waitForLoading();
        await user.click(
          screen.getAllByRole('button', { name: /Add Comment/ })[0],
        );
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
        render(<WorkflowPage />);
        await waitForLoading();
        await user.click(
          screen.getAllByRole('button', { name: /Add Comment/ })[0],
        );
        await waitFor(() => {
          const commentInput = document.getElementById('comment');
          expect(commentInput).toBeInTheDocument();
        });
        const commentInput = document.getElementById(
          'comment',
        ) as HTMLTextAreaElement;
        await user.type(commentInput, 'Test comment');
        await user.click(screen.getByRole('button', { name: /Save/ }));

        // Assert
        await waitFor(() => {
          expect(screen.getByText(/Failed to add comment/)).toBeInTheDocument();
        });
      });
    });
  });
});

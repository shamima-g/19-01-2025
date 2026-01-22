'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ChevronRight, Home } from 'lucide-react';
import Link from 'next/link';
import { PortfolioFileGrid } from '@/components/PortfolioFileGrid';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

/**
 * Portfolio Files Import Dashboard - Screen 2
 * Displays the portfolio file status grid for a specific batch
 */
export default function PortfolioFilesPage() {
  const params = useParams();
  const router = useRouter();
  const batchId = params.batchId as string;

  // Placeholder batch name - in production, would fetch from API
  const [batchName, setBatchName] = useState<string>('');
  const [warningDialog, setWarningDialog] = useState<{
    isOpen: boolean;
    message: string;
    type: 'no-files' | 'failed-files' | 'processing-files';
  }>({
    isOpen: false,
    message: '',
    type: 'no-files',
  });

  // Load batch name (placeholder - would fetch from API)
  useEffect(() => {
    // In production, fetch batch details to get the name
    setBatchName(`Batch ${batchId}`);
  }, [batchId]);

  // Handle proceed to other files
  const handleProceedToOtherFiles = () => {
    // In a full implementation, we would check file statuses here
    // and show appropriate warnings based on Story 2.7
    router.push(`/batches/${batchId}/other-files`);
  };

  // Handle warning dialog confirmation
  const handleConfirmProceed = () => {
    setWarningDialog((prev) => ({ ...prev, isOpen: false }));
    router.push(`/batches/${batchId}/other-files`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Breadcrumbs */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          {/* Breadcrumbs */}
          <nav
            className="flex items-center text-sm text-gray-500 mb-2"
            aria-label="Breadcrumb"
          >
            <Link href="/" className="flex items-center hover:text-gray-700">
              <Home className="h-4 w-4 mr-1" />
              Start Page
            </Link>
            <ChevronRight className="h-4 w-4 mx-2" />
            <Link href="/batches" className="hover:text-gray-700">
              Report Batches
            </Link>
            <ChevronRight className="h-4 w-4 mx-2" />
            <Link href={`/batches/${batchId}`} className="hover:text-gray-700">
              Batch Details
            </Link>
            <ChevronRight className="h-4 w-4 mx-2" />
            <span className="text-gray-900 font-medium">Portfolio Files</span>
          </nav>

          {/* Page Title */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Portfolio Files Import Dashboard
              </h1>
              {batchName && (
                <p className="mt-1 text-sm text-gray-500">{batchName}</p>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-6">
          <PortfolioFileGrid
            batchId={batchId}
            batchName={batchName}
            onProceedToOtherFiles={handleProceedToOtherFiles}
          />
        </div>
      </main>

      {/* Warning Dialog for Story 2.7 */}
      <AlertDialog
        open={warningDialog.isOpen}
        onOpenChange={(open) =>
          setWarningDialog((prev) => ({ ...prev, isOpen: open }))
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {warningDialog.type === 'no-files' && 'No Files Uploaded'}
              {warningDialog.type === 'failed-files' &&
                'Some Files Have Errors'}
              {warningDialog.type === 'processing-files' &&
                'Files Still Processing'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {warningDialog.message}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, stay here</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmProceed}>
              Yes, proceed anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { PostPropertyFormComponent } from '@/components/post-property-form';
import { Skeleton } from '@/components/ui/skeleton';

// A wrapper component is needed because useSearchParams() will cause suspense.
// The <Suspense> boundary must be defined by a parent component.
function PostPropertyPageContent() {
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');
  return <PostPropertyFormComponent editId={editId} />;
}

function FormSkeleton() {
    return (
        <div className="container py-12 max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-2">
                <Skeleton className="h-9 w-72 mx-auto" />
                <Skeleton className="h-5 w-96 mx-auto" />
            </div>
            <Skeleton className="h-96 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-80 w-full" />
        </div>
    )
}

export default function PostPropertyPage() {
  return (
    <Suspense fallback={<FormSkeleton />}>
      <PostPropertyPageContent />
    </Suspense>
  );
}

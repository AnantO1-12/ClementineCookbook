import { Link } from 'react-router-dom';

import { EmptyState } from '../components/ui/EmptyState';

export function NotFoundPage() {
  return (
    <EmptyState
      title="Page not found"
      description="That page is not part of this cookbook. Head back to the recipe shelf and keep cooking."
      action={<Link to="/" className="btn-primary">Back home</Link>}
    />
  );
}

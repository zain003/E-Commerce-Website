import React from "react";

export default function AccountLoading() {
  return (
    <div className="container max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8 animate-pulse">
      <div className="space-y-2">
        <div className="h-8 w-44 rounded-md bg-muted" />
        <div className="h-4 w-72 rounded bg-muted/60" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="h-80 rounded-xl border border-border bg-card p-6" />
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="h-28 rounded-xl border border-border bg-card p-5" />
          <div className="h-28 rounded-xl border border-border bg-card p-5" />
          <div className="h-28 rounded-xl border border-border bg-card p-5" />
          <div className="h-28 rounded-xl border border-border bg-card p-5" />
        </div>
      </div>
    </div>
  );
}

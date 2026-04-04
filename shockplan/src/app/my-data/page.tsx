"use client";

import { Settings, Lock, Download, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AppShell } from "@/components/app-shell";

export default function MyDataPage() {
  return (
    <AppShell>
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 lg:pt-10 pb-8">
        <section className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 shrink-0">
              <Settings className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight">My Data</h1>
          </div>
          <p className="text-base text-muted-foreground mt-2">
            Your data belongs to you. View, export, or delete it anytime.
          </p>
        </section>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="border border-border bg-card rounded-2xl">
            <CardContent className="p-5 flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Lock className="h-6 w-6 text-primary" />
              </div>
              <p className="font-bold text-foreground">Privacy First</p>
              <p className="text-sm text-muted-foreground">Your data is encrypted and stored on your device. We never sell it.</p>
            </CardContent>
          </Card>

          <Card className="border border-border bg-card rounded-2xl">
            <CardContent className="p-5 flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Download className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="font-bold text-foreground">Export Data</p>
              <p className="text-sm text-muted-foreground">Download all your profile and budget data as JSON.</p>
              <Button variant="outline" size="sm" className="rounded-xl mt-2">Coming Soon</Button>
            </CardContent>
          </Card>

          <Card className="border border-border bg-card rounded-2xl">
            <CardContent className="p-5 flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <Trash2 className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <p className="font-bold text-foreground">Delete Data</p>
              <p className="text-sm text-muted-foreground">Permanently remove all your data from our servers.</p>
              <Button variant="outline" size="sm" className="rounded-xl mt-2 text-destructive border-destructive/30 hover:bg-destructive/10">Coming Soon</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

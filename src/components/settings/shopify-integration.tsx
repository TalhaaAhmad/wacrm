'use client';

import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import {
  Plus,
  Trash2,
  Copy,
  Loader2,
  Store,
  ChevronDown,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Minus,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import type {
  MessageTemplate,
  ShopifyStore,
  ShopifyNotificationRule,
  ShopifyVariableMapping,
  ShopifyWebhookLog,
} from '@/types';

// Available order fields for variable mapping
const ORDER_FIELDS: { value: ShopifyVariableMapping['source']; label: string }[] = [
  { value: 'order_number', label: 'Order Number' },
  { value: 'customer_name', label: 'Customer Name' },
  { value: 'total_price', label: 'Total Price' },
  { value: 'currency', label: 'Currency' },
  { value: 'item_count', label: 'Item Count' },
  { value: 'tracking_number', label: 'Tracking Number' },
  { value: 'financial_status', label: 'Financial Status' },
  { value: 'product_details', label: 'Product Details' },
  { value: 'shipping_address', label: 'Shipping Address' },
  { value: 'shipping_city', label: 'Shipping City' },

];

const EVENT_TYPES = [
  { value: 'order_created', label: 'Order Created' },
  { value: 'order_fulfilled', label: 'Order Fulfilled' },
] as const;

type EventType = (typeof EVENT_TYPES)[number]['value'];

// ============================================================
// Main component
// ============================================================

export function ShopifyIntegration() {
  const supabase = createClient();
  const { user, loading: authLoading } = useAuth();

  const [stores, setStores] = useState<ShopifyStore[]>([]);
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const fetchStores = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch('/api/shopify/stores');
      const data = await res.json();
      if (res.ok) {
        setStores(data.stores ?? []);
      }
    } catch (err) {
      console.error('Failed to fetch stores:', err);
      toast.error('Failed to load Shopify stores');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }
    fetchStores();
  }, [authLoading, user, fetchStores]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Shopify Stores</h3>
          <p className="text-sm text-muted-foreground">
            Connect your Shopify stores to send WhatsApp notifications on order events.
          </p>
        </div>
        <Button
          onClick={() => setAddDialogOpen(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Plus className="size-4" />
          Add Store
        </Button>
      </div>

      {stores.length === 0 ? (
        <Card className="bg-card border-border ring-0">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Store className="size-12 text-muted-foreground mb-4" />
            <p className="text-foreground font-medium">No Shopify stores connected</p>
            <p className="text-sm text-muted-foreground mt-1">
              Add your first store to start sending WhatsApp notifications.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Accordion>
          {stores.map((store) => (
            <StoreCard
              key={store.id}
              store={store}
              onDeleted={fetchStores}
              onToggle={fetchStores}
            />
          ))}
        </Accordion>
      )}

      <AddStoreDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onCreated={fetchStores}
      />
    </div>
  );
}

// ============================================================
// Store card with notification rules + logs
// ============================================================

function StoreCard({
  store,
  onDeleted,
  onToggle,
}: {
  store: ShopifyStore;
  onDeleted: () => void;
  onToggle: () => void;
}) {
  const [deleting, setDeleting] = useState(false);
  const [toggling, setToggling] = useState(false);

  const webhookUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/api/shopify/webhook/${store.id}`
      : '';

  async function handleDelete() {
    if (!confirm(`Delete store "${store.store_name}"? This will remove all notification rules.`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/shopify/stores/${store.id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Store deleted');
        onDeleted();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to delete store');
      }
    } catch {
      toast.error('Failed to delete store');
    } finally {
      setDeleting(false);
    }
  }

  async function handleToggle(checked: boolean) {
    setToggling(true);
    try {
      const res = await fetch(`/api/shopify/stores/${store.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: checked }),
      });
      if (res.ok) {
        toast.success(checked ? 'Store activated' : 'Store deactivated');
        onToggle();
      }
    } catch {
      toast.error('Failed to toggle store');
    } finally {
      setToggling(false);
    }
  }

  function copyWebhookUrl() {
    navigator.clipboard.writeText(webhookUrl);
    toast.success('Webhook URL copied');
  }

  return (
    <AccordionItem className="border-border" value={store.id}>
      <Card className="bg-card border-border ring-0 mb-4">
        <AccordionTrigger className="w-full px-0 hover:no-underline">
          <div className="flex items-center gap-3 w-full px-4">
            <Store className="size-5 text-primary shrink-0" />
            <div className="flex-1 text-left min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground truncate">
                  {store.store_name}
                </span>
                <Badge variant={store.is_active ? 'default' : 'secondary'}>
                  {store.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground truncate">{store.shop_domain}</p>
            </div>
            <ChevronDown className="size-4 text-muted-foreground shrink-0 transition-transform [[data-popup-open]>&]:rotate-180" />
          </div>
        </AccordionTrigger>

        <AccordionContent className="space-y-6 pt-4">
          <Separator className="bg-border" />

          {/* Webhook URL */}
          <div className="space-y-2">
            <Label className="text-foreground text-xs">Webhook URL</Label>
            <div className="flex gap-2">
              <Input
                readOnly
                value={webhookUrl}
                className="bg-muted border-border text-foreground font-mono text-xs"
              />
              <Button variant="outline" size="icon" onClick={copyWebhookUrl} className="shrink-0 border-border">
                <Copy className="size-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Add this URL in your Shopify admin under Settings &gt; Notifications &gt; Webhooks.
              Subscribe to <code className="text-primary">orders/create</code> and{' '}
              <code className="text-primary">orders/fulfilled</code> topics.
            </p>
          </div>

          {/* Store actions */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch checked={store.is_active} onCheckedChange={handleToggle} disabled={toggling} />
              <span className="text-sm text-foreground">
                {store.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              disabled={deleting}
              className="border-red-900 text-red-400 hover:text-red-300 hover:bg-red-950/40 ml-auto"
            >
              {deleting ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
              Delete Store
            </Button>
          </div>

          {/* Notification Rules */}
          <NotificationRulesSection storeId={store.id} />

          {/* Webhook Logs */}
          <WebhookLogsSection storeId={store.id} />
        </AccordionContent>
      </Card>
    </AccordionItem>
  );
}

// ============================================================
// Add Store Dialog
// ============================================================

function AddStoreDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}) {
  const [storeName, setStoreName] = useState('');
  const [shopDomain, setShopDomain] = useState('');
  const [saving, setSaving] = useState(false);
  const [createdUrl, setCreatedUrl] = useState<string | null>(null);

  function resetForm() {
    setStoreName('');
    setShopDomain('');
    setCreatedUrl(null);
  }

  async function handleCreate() {
    if (!storeName.trim() || !shopDomain.trim()) {
      toast.error('Store name and domain are required');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/shopify/stores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          store_name: storeName.trim(),
          shop_domain: shopDomain.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to create store');
        return;
      }

      setCreatedUrl(data.webhook_url);
      toast.success('Store created! Copy the webhook URL below.');
      onCreated();
    } catch {
      toast.error('Failed to create store');
    } finally {
      setSaving(false);
    }
  }

  function handleClose() {
    resetForm();
    onOpenChange(false);
  }

  function copyUrl() {
    if (createdUrl) {
      navigator.clipboard.writeText(
        typeof window !== 'undefined' ? `${window.location.origin}${createdUrl}` : createdUrl,
      );
      toast.success('Webhook URL copied');
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Shopify Store</DialogTitle>
          <DialogDescription>
            Connect a Shopify store to receive order webhooks and send WhatsApp notifications.
          </DialogDescription>
        </DialogHeader>

        {createdUrl ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-green-500">
              <CheckCircle2 className="size-4" />
              Store created successfully!
            </div>
            <div className="space-y-2">
              <Label className="text-foreground text-xs">Webhook URL</Label>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={`${typeof window !== 'undefined' ? window.location.origin : ''}${createdUrl}`}
                  className="bg-muted border-border text-foreground font-mono text-xs"
                />
                <Button variant="outline" size="icon" onClick={copyUrl} className="shrink-0 border-border">
                  <Copy className="size-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Paste this URL in your Shopify admin under Settings &gt; Notifications &gt; Webhooks.
                Subscribe to <code className="text-primary">orders/create</code> and{' '}
                <code className="text-primary">orders/fulfilled</code> topics.
              </p>
            </div>
            <DialogFooter>
              <Button onClick={handleClose} className="bg-primary text-primary-foreground">
                Done
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-foreground">Store Name</Label>
              <Input
                placeholder="e.g. My Store"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="bg-muted border-border text-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Shop Domain</Label>
              <Input
                placeholder="e.g. mystore.myshopify.com"
                value={shopDomain}
                onChange={(e) => setShopDomain(e.target.value)}
                className="bg-muted border-border text-foreground"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>Cancel</Button>
              <Button
                onClick={handleCreate}
                disabled={saving}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {saving ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Add Store'
                )}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ============================================================
// Notification Rules Section
// ============================================================

function NotificationRulesSection({ storeId }: { storeId: string }) {
  const [rules, setRules] = useState<ShopifyNotificationRule[]>([]);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [rulesRes, templatesRes] = await Promise.all([
        fetch(`/api/shopify/rules?store_id=${storeId}`),
        fetch('/api/whatsapp/templates'),
      ]);

      if (rulesRes.ok) {
        const data = await rulesRes.json();
        setRules(data.rules ?? []);
      }

      if (templatesRes.ok) {
        const data = await templatesRes.json();
        setTemplates((data.templates ?? []).filter((t: MessageTemplate) => t.status === 'Approved'));
      }
    } catch (err) {
      console.error('Failed to fetch rules/templates:', err);
    } finally {
      setLoading(false);
    }
  }, [storeId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Loading rules...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium text-foreground">Notification Rules</h4>
      {EVENT_TYPES.map((event) => {
        const existingRule = rules.find((r) => r.event_type === event.value);
        return (
          <RuleEditor
            key={event.value}
            storeId={storeId}
            eventType={event.value}
            eventLabel={event.label}
            existingRule={existingRule}
            templates={templates}
            onSaved={fetchData}
          />
        );
      })}
    </div>
  );
}

// ============================================================
// Rule Editor
// ============================================================

function RuleEditor({
  storeId,
  eventType,
  eventLabel,
  existingRule,
  templates,
  onSaved,
}: {
  storeId: string;
  eventType: EventType;
  eventLabel: string;
  existingRule?: ShopifyNotificationRule;
  templates: MessageTemplate[];
  onSaved: () => void;
}) {
  const [isActive, setIsActive] = useState(existingRule?.is_active ?? true);
  const [templateName, setTemplateName] = useState(existingRule?.template_name ?? '');
  const [variableMapping, setVariableMapping] = useState<ShopifyVariableMapping[]>(
    existingRule?.variable_mapping ?? [],
  );
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  // Sync when existingRule changes (e.g. after save)
  useEffect(() => {
    setIsActive(existingRule?.is_active ?? true);
    setTemplateName(existingRule?.template_name ?? '');
    setVariableMapping(existingRule?.variable_mapping ?? []);
    setDirty(false);
  }, [existingRule]);

  function addMapping() {
    const nextPosition = variableMapping.length > 0
      ? Math.max(...variableMapping.map((m) => m.position)) + 1
      : 1;
    setVariableMapping([...variableMapping, { position: nextPosition, source: 'order_number' }]);
    setDirty(true);
  }

  function removeMapping(index: number) {
    setVariableMapping(variableMapping.filter((_, i) => i !== index));
    setDirty(true);
  }

  function updateMappingSource(index: number, source: ShopifyVariableMapping['source']) {
    setVariableMapping(variableMapping.map((m, i) => (i === index ? { ...m, source } : m)));
    setDirty(true);
  }

  async function handleSave() {
    if (!templateName) {
      toast.error('Select a template');
      return;
    }

    // Find the selected template to get its language
    const selectedTemplate = templates.find((t) => t.name === templateName);
    const templateLanguage = selectedTemplate?.language ?? 'en_US';

    setSaving(true);
    try {
      const res = await fetch('/api/shopify/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          store_id: storeId,
          event_type: eventType,
          template_name: templateName,
          template_language: templateLanguage,
          variable_mapping: variableMapping,
          is_active: isActive,
        }),
      });

      if (res.ok) {
        toast.success(`${eventLabel} rule saved`);
        onSaved();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to save rule');
      }
    } catch {
      toast.error('Failed to save rule');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="bg-muted/30 border-border ring-0">
      <CardContent className="pt-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">{eventLabel}</span>
            {existingRule && (
              <Badge variant="outline" className="text-xs">Configured</Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={isActive}
              onCheckedChange={(v) => { setIsActive(v); setDirty(true); }}
            />
            <span className="text-xs text-muted-foreground">{isActive ? 'On' : 'Off'}</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-foreground text-xs">WhatsApp Template</Label>
          <Select
            value={templateName || undefined}
            onValueChange={(val) => { setTemplateName(val ?? ''); setDirty(true); }}
          >
            <SelectTrigger className="w-full bg-muted border-border text-foreground">
              <SelectValue placeholder="Select a template..." />
            </SelectTrigger>
            <SelectContent className="bg-muted border-border">
              {templates.length === 0 ? (
                <SelectItem value="__none" disabled>No approved templates</SelectItem>
              ) : (
                templates.map((t) => (
                  <SelectItem key={t.id} value={t.name}>{t.name}</SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Variable Mapping */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-foreground text-xs">Variable Mapping</Label>
            <Button variant="ghost" size="sm" onClick={addMapping} className="text-xs h-6 px-2">
              <Plus className="size-3" />
              Add
            </Button>
          </div>

          {variableMapping.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              No variables mapped. Click Add to map order fields to template parameters.
            </p>
          ) : (
            <div className="space-y-2">
              {variableMapping.map((mapping, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-6 shrink-0">
                    #{mapping.position}
                  </span>
                  <Select
                    value={mapping.source}
                    onValueChange={(val) => updateMappingSource(index, val as ShopifyVariableMapping['source'])}
                  >
                    <SelectTrigger className="flex-1 bg-muted border-border text-foreground text-xs h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-muted border-border">
                      {ORDER_FIELDS.map((field) => (
                        <SelectItem key={field.value} value={field.value}>
                          {field.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 shrink-0 text-muted-foreground hover:text-red-400"
                    onClick={() => removeMapping(index)}
                  >
                    <Minus className="size-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {dirty && (
          <Button
            size="sm"
            onClick={handleSave}
            disabled={saving}
            className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs"
          >
            {saving ? <Loader2 className="size-3 animate-spin" /> : null}
            Save Rule
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================
// Webhook Logs Section
// ============================================================

function WebhookLogsSection({ storeId }: { storeId: string }) {
  const [logs, setLogs] = useState<ShopifyWebhookLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(async () => {
    try {
      const res = await fetch(`/api/shopify/logs?store_id=${storeId}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs ?? []);
      }
    } catch (err) {
      console.error('Failed to fetch logs:', err);
    } finally {
      setLoading(false);
    }
  }, [storeId]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Loading logs...
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-foreground">Recent Webhook Events</h4>
        <Button variant="ghost" size="sm" onClick={fetchLogs} className="text-xs h-6 px-2">
          <RefreshCw className="size-3" />
        </Button>
      </div>

      {logs.length === 0 ? (
        <p className="text-xs text-muted-foreground">No webhook events received yet.</p>
      ) : (
        <div className="rounded-md border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="text-xs">Time</TableHead>
                <TableHead className="text-xs">Event</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                <TableHead className="text-xs">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(log.created_at).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-xs">
                    <Badge variant="outline" className="text-xs">{log.event_type}</Badge>
                  </TableCell>
                  <TableCell>
                    {log.status === 'processed' ? (
                      <CheckCircle2 className="size-4 text-green-500" />
                    ) : log.status === 'failed' ? (
                      <XCircle className="size-4 text-red-500" />
                    ) : (
                      <Minus className="size-4 text-muted-foreground" />
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-48 truncate">
                    {log.error_message || (log.whatsapp_message_id ? `WA: ${log.whatsapp_message_id}` : '-')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}


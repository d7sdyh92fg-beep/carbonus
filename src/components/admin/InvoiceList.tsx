import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { FileText, Eye, Download, Send, Loader2, Receipt, Trash2, RefreshCw, Search, X } from 'lucide-react';
import { format } from 'date-fns';
import { ConfirmationDialog } from '@/components/ui/alert-confirmation-dialog';
import { InvoiceManager } from '@/components/admin/InvoiceManager';

interface InvoiceRow {
  id: string;
  invoice_number: string;
  invoice_prefix: string;
  issue_date: string;
  total_amount: number;
  status: string;
  pdf_url: string;
  sent_at: string | null;
  created_at: string;
  reservation_id: string | null;
  customers: {
    first_name: string;
    last_name: string;
    email: string;
  } | null;
}

export const InvoiceList: React.FC = () => {
  const { toast } = useToast();
  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<InvoiceRow | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editInvoice, setEditInvoice] = useState<InvoiceRow | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*, customers(*)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvoices((data || []) as unknown as InvoiceRow[]);
    } catch (err: any) {
      console.error('Error fetching invoices:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = async (invoice: InvoiceRow) => {
    try {
      const { data, error } = await supabase.storage
        .from('contracts')
        .createSignedUrl(invoice.pdf_url, 300);
      if (error) throw error;
      if (data?.signedUrl) window.open(data.signedUrl, '_blank');
    } catch {
      toast({ title: 'Klaida', description: 'Nepavyko atidaryti PDF', variant: 'destructive' });
    }
  };

  const handleDownload = async (invoice: InvoiceRow) => {
    try {
      const { data, error } = await supabase.storage
        .from('contracts')
        .download(invoice.pdf_url);
      if (error) throw error;
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Saskaita_${invoice.invoice_number.replace(/[\s\/]/g, '_')}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast({ title: 'Klaida', description: 'Nepavyko atsisiųsti', variant: 'destructive' });
    }
  };

  const handleSend = async (invoice: InvoiceRow) => {
    setSendingId(invoice.id);
    try {
      const { data, error } = await supabase.functions.invoke('send-invoice-email', {
        body: { invoiceId: invoice.id },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast({ title: 'Sąskaita išsiųsta', description: `${invoice.invoice_number} išsiųsta klientui` });
      await fetchInvoices();
    } catch (err: any) {
      toast({ title: 'Klaida siunčiant', description: err.message, variant: 'destructive' });
    } finally {
      setSendingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeletingId(deleteTarget.id);
    try {
      // Delete PDF from storage if exists
      if (deleteTarget.pdf_url) {
        await supabase.storage.from('contracts').remove([deleteTarget.pdf_url]);
      }
      // Delete invoice record
      const { error } = await supabase.from('invoices').delete().eq('id', deleteTarget.id);
      if (error) throw error;
      toast({ title: 'Ištrinta', description: `Sąskaita ${deleteTarget.invoice_number} ištrinta` });
      await fetchInvoices();
    } catch (err: any) {
      toast({ title: 'Klaida', description: err.message, variant: 'destructive' });
    } finally {
      setDeletingId(null);
      setDeleteTarget(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; className: string }> = {
      draft: { label: 'Juodraštis', className: 'bg-yellow-100 text-yellow-800' },
      confirmed: { label: 'Patvirtinta', className: 'bg-blue-100 text-blue-800' },
      sent: { label: 'Išsiųsta ✅', className: 'bg-green-100 text-green-800' },
    };
    const c = config[status] || { label: status, className: 'bg-gray-100 text-gray-800' };
    return <Badge className={c.className}>{c.label}</Badge>;
  };

  const totalRevenue = invoices
    .filter(i => i.status === 'sent' || i.status === 'confirmed')
    .reduce((sum, i) => sum + Number(i.total_amount), 0);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Iš viso</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold">{invoices.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Išsiųstos</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold">{invoices.filter(i => i.status === 'sent').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Juodraščiai</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold">{invoices.filter(i => i.status === 'draft').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Suma</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold text-green-600">€{totalRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Sąskaitos faktūros
          </CardTitle>
          <CardDescription>Visos sugeneruotos sąskaitos</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : invoices.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nėra sugeneruotų sąskaitų
            </div>
          ) : (
            <>
              {/* Desktop */}
              <div className="hidden lg:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nr.</TableHead>
                      <TableHead>Klientas</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Suma</TableHead>
                      <TableHead>Statusas</TableHead>
                      <TableHead>Išsiųsta</TableHead>
                      <TableHead>Veiksmai</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.map((inv) => (
                      <TableRow key={inv.id}>
                        <TableCell className="font-medium">{inv.invoice_number}</TableCell>
                        <TableCell>
                          {inv.customers
                            ? `${inv.customers.first_name} ${inv.customers.last_name}`
                            : '—'}
                        </TableCell>
                        <TableCell>{inv.issue_date}</TableCell>
                        <TableCell className="font-semibold">€{Number(inv.total_amount).toFixed(2)}</TableCell>
                        <TableCell>{getStatusBadge(inv.status)}</TableCell>
                        <TableCell>
                          {inv.sent_at ? format(new Date(inv.sent_at), 'yyyy-MM-dd HH:mm') : '—'}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" onClick={() => handlePreview(inv)} title="Peržiūrėti">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDownload(inv)} title="Atsisiųsti">
                              <Download className="h-4 w-4" />
                            </Button>
                            {inv.status === 'draft' && inv.reservation_id && (
                              <Button variant="ghost" size="sm" onClick={() => setEditInvoice(inv)} title="Redaguoti / Pergeneruoti">
                                <RefreshCw className="h-4 w-4" />
                              </Button>
                            )}
                            {(inv.status === 'confirmed' || inv.status === 'sent') && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleSend(inv)}
                                disabled={sendingId === inv.id}
                                title={inv.status === 'sent' ? 'Siųsti pakartotinai' : 'Siųsti'}
                              >
                                {sendingId === inv.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeleteTarget(inv)}
                              disabled={deletingId === inv.id}
                              title="Ištrinti"
                              className="text-destructive hover:text-destructive"
                            >
                              {deletingId === inv.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile */}
              <div className="lg:hidden space-y-3">
                {invoices.map((inv) => (
                  <Card key={inv.id} className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-semibold text-sm">{inv.invoice_number}</div>
                          <div className="text-xs text-muted-foreground">
                            {inv.customers ? `${inv.customers.first_name} ${inv.customers.last_name}` : '—'}
                          </div>
                        </div>
                        {getStatusBadge(inv.status)}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-muted-foreground">Data:</span>
                          <div className="font-medium">{inv.issue_date}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Suma:</span>
                          <div className="font-semibold">€{Number(inv.total_amount).toFixed(2)}</div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 pt-2 border-t">
                        <Button variant="outline" size="sm" onClick={() => handlePreview(inv)} className="text-xs flex-1">
                          <Eye className="h-3 w-3 mr-1" /> Peržiūrėti
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDownload(inv)} className="text-xs flex-1">
                          <Download className="h-3 w-3 mr-1" /> Atsisiųsti
                        </Button>
                        {inv.status === 'draft' && inv.reservation_id && (
                          <Button variant="outline" size="sm" onClick={() => setEditInvoice(inv)} className="text-xs flex-1">
                            <RefreshCw className="h-3 w-3 mr-1" /> Redaguoti
                          </Button>
                        )}
                        {(inv.status === 'confirmed' || inv.status === 'sent') && (
                          <Button
                            size="sm"
                            onClick={() => handleSend(inv)}
                            disabled={sendingId === inv.id}
                            className="text-xs flex-1"
                          >
                            {sendingId === inv.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3 mr-1" />}
                            Siųsti
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeleteTarget(inv)}
                          disabled={deletingId === inv.id}
                          className="text-xs flex-1 text-destructive border-destructive hover:bg-destructive/10"
                        >
                          {deletingId === inv.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3 mr-1" />}
                          Ištrinti
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete confirmation */}
      <ConfirmationDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Ištrinti sąskaitą faktūrą?"
        description={`Ar tikrai norite ištrinti sąskaitą ${deleteTarget?.invoice_number || ''}? Šis veiksmas negrįžtamas.`}
        confirmText="Ištrinti"
        cancelText="Atšaukti"
        variant="destructive"
      />

      {/* Edit/Regenerate modal for draft invoices */}
      {editInvoice && editInvoice.reservation_id && (
        <InvoiceManager
          reservationId={editInvoice.reservation_id}
          customerName={editInvoice.customers ? `${editInvoice.customers.first_name} ${editInvoice.customers.last_name}` : ''}
          carName=""
          totalAmount={Number(editInvoice.total_amount)}
          isOpen={!!editInvoice}
          onClose={() => {
            setEditInvoice(null);
            fetchInvoices();
          }}
        />
      )}
    </div>
  );
};

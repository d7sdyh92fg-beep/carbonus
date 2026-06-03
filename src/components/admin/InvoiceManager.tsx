import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { FileText, Send, Eye, Download, Loader2, CheckCircle, Plus, Trash2, RotateCcw, Edit } from 'lucide-react';

interface InvoiceManagerProps {
  reservationId: string;
  customerName: string;
  carName: string;
  totalAmount: number;
  isOpen: boolean;
  onClose: () => void;
}

interface InvoiceItem {
  name: string;
  unit: string;
  qty: number;
  price: number;
  total: number;
}

interface Invoice {
  id: string;
  invoice_number: string;
  invoice_prefix: string;
  issue_date: string;
  total_amount: number;
  status: string;
  pdf_url: string;
  sent_at: string | null;
  items: InvoiceItem[];
}

export const InvoiceManager: React.FC<InvoiceManagerProps> = ({
  reservationId,
  customerName,
  carName,
  totalAmount,
  isOpen,
  onClose,
}) => {
  const { toast } = useToast();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingItems, setEditingItems] = useState<InvoiceItem[] | null>(null);
  const [editingNumber, setEditingNumber] = useState<string>('');
  const [editingIssueDate, setEditingIssueDate] = useState<string>('');

  useEffect(() => {
    if (isOpen && reservationId) {
      fetchExistingInvoice();
    }
    if (!isOpen) {
      setEditingItems(null);
    }
  }, [isOpen, reservationId]);

  const fetchExistingInvoice = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('reservation_id', reservationId)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;
      if (data && data.length > 0) {
        setInvoice(data[0] as unknown as Invoice);
      } else {
        setInvoice(null);
      }
    } catch (err: any) {
      console.error('Error fetching invoice:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-invoice-pdf', {
        body: { reservationId, prefix: 'CARW' },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast({ title: 'Sąskaita sugeneruota', description: `Nr: ${data.invoiceNumber}` });
      await fetchExistingInvoice();
    } catch (err: any) {
      toast({ title: 'Klaida', description: err.message, variant: 'destructive' });
    } finally {
      setIsGenerating(false);
    }
  };

  const startEditing = () => {
    if (invoice?.items) {
      setEditingItems(JSON.parse(JSON.stringify(invoice.items)));
    }
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    if (!editingItems) return;
    const updated = [...editingItems];
    if (field === 'name' || field === 'unit') {
      updated[index] = { ...updated[index], [field]: value };
    } else {
      const numVal = Number(value) || 0;
      updated[index] = { ...updated[index], [field]: numVal };
      if (field === 'qty' || field === 'price') {
        updated[index].total = updated[index].qty * updated[index].price;
      }
    }
    setEditingItems(updated);
  };

  const addItem = () => {
    if (!editingItems) return;
    setEditingItems([...editingItems, { name: '', unit: 'vnt.', qty: 1, price: 0, total: 0 }]);
  };

  const removeItem = (index: number) => {
    if (!editingItems || editingItems.length <= 1) return;
    setEditingItems(editingItems.filter((_, i) => i !== index));
  };

  const getEditingTotal = () => {
    if (!editingItems) return 0;
    return editingItems.reduce((sum, item) => sum + item.total, 0);
  };

  const handleSaveItems = async () => {
    if (!invoice || !editingItems) return;
    setIsSaving(true);
    try {
      const newTotal = getEditingTotal();
      const { error } = await supabase
        .from('invoices')
        .update({ items: editingItems as any, total_amount: newTotal })
        .eq('id', invoice.id);

      if (error) throw error;
      toast({ title: 'Eilutės išsaugotos' });
      setEditingItems(null);
      await fetchExistingInvoice();
    } catch (err: any) {
      toast({ title: 'Klaida', description: err.message, variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRegeneratePdf = async () => {
    if (!invoice) return;
    setIsRegenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-invoice-pdf', {
        body: { reservationId, prefix: invoice.invoice_prefix, invoiceId: invoice.id },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast({ title: 'PDF pergeneruotas' });
      await fetchExistingInvoice();
    } catch (err: any) {
      toast({ title: 'Klaida', description: err.message, variant: 'destructive' });
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleConfirm = async () => {
    if (!invoice) return;
    setIsConfirming(true);
    try {
      const { error } = await supabase
        .from('invoices')
        .update({ status: 'confirmed' })
        .eq('id', invoice.id);

      if (error) throw error;
      toast({ title: 'Sąskaita patvirtinta' });
      await fetchExistingInvoice();
    } catch (err: any) {
      toast({ title: 'Klaida', description: err.message, variant: 'destructive' });
    } finally {
      setIsConfirming(false);
    }
  };

  const handleSend = async () => {
    if (!invoice) return;
    setIsSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-invoice-email', {
        body: { invoiceId: invoice.id },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast({ title: 'Sąskaita išsiųsta', description: `Išsiųsta klientui ir į info@carbonus.lt` });
      await fetchExistingInvoice();
    } catch (err: any) {
      toast({ title: 'Klaida siunčiant', description: err.message, variant: 'destructive' });
    } finally {
      setIsSending(false);
    }
  };

  const handlePreview = async () => {
    if (!invoice?.pdf_url) return;
    try {
      const { data, error } = await supabase.storage
        .from('contracts')
        .createSignedUrl(invoice.pdf_url, 300);

      if (error) throw error;
      if (data?.signedUrl) {
        window.open(data.signedUrl, '_blank');
      }
    } catch (err: any) {
      toast({ title: 'Klaida', description: 'Nepavyko atidaryti PDF', variant: 'destructive' });
    }
  };

  const handleDownload = async () => {
    if (!invoice?.pdf_url) return;
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
    } catch (err: any) {
      toast({ title: 'Klaida', description: 'Nepavyko atsisiųsti', variant: 'destructive' });
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Sąskaita faktūra
          </DialogTitle>
          <DialogDescription>
            {customerName} — {carName}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : !invoice ? (
          <div className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground mb-4">
                  Šiam užsakymui dar nėra sugeneruota sąskaita faktūra.
                </p>
                <div className="text-sm space-y-1 mb-4">
                  <p><strong>Klientas:</strong> {customerName}</p>
                  <p><strong>Automobilis:</strong> {carName}</p>
                  <p><strong>Suma:</strong> {totalAmount.toFixed(2)} €</p>
                </div>
                <Button onClick={handleGenerate} disabled={isGenerating} className="w-full">
                  {isGenerating ? (
                    <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Generuojama...</>
                  ) : (
                    <><FileText className="h-4 w-4 mr-2" /> Generuoti sąskaitą</>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{invoice.invoice_number}</CardTitle>
                  {getStatusBadge(invoice.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm space-y-1">
                  <p><strong>Data:</strong> {invoice.issue_date}</p>
                  <p><strong>Suma:</strong> {Number(invoice.total_amount).toFixed(2)} €</p>
                  {invoice.sent_at && (
                    <p><strong>Išsiųsta:</strong> {new Date(invoice.sent_at).toLocaleString('lt-LT')}</p>
                  )}
                </div>

                <Separator />

                {/* Invoice Items - View or Edit */}
                {editingItems ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-semibold">Sąskaitos eilutės</Label>
                      <Button variant="outline" size="sm" onClick={addItem}>
                        <Plus className="h-3 w-3 mr-1" /> Pridėti
                      </Button>
                    </div>
                    {editingItems.map((item, index) => (
                      <Card key={index} className="p-3">
                        <div className="space-y-2">
                          <div className="flex items-start gap-2">
                            <div className="flex-1">
                              <Label className="text-xs text-muted-foreground">Pavadinimas</Label>
                              <Input
                                value={item.name}
                                onChange={(e) => updateItem(index, 'name', e.target.value)}
                                className="text-sm"
                                maxLength={200}
                              />
                            </div>
                            {editingItems.length > 1 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeItem(index)}
                                className="mt-5 text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                          <div className="grid grid-cols-4 gap-2">
                            <div>
                              <Label className="text-xs text-muted-foreground">Mato vnt.</Label>
                              <Input
                                value={item.unit}
                                onChange={(e) => updateItem(index, 'unit', e.target.value)}
                                className="text-sm"
                                maxLength={10}
                              />
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">Kiekis</Label>
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                value={item.qty}
                                onChange={(e) => updateItem(index, 'qty', e.target.value)}
                                className="text-sm"
                              />
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">Kaina €</Label>
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                value={item.price}
                                onChange={(e) => updateItem(index, 'price', e.target.value)}
                                className="text-sm"
                              />
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">Suma €</Label>
                              <div className="h-9 flex items-center text-sm font-medium px-3 bg-muted rounded-md">
                                {item.total.toFixed(2)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className="font-semibold">Iš viso: {getEditingTotal().toFixed(2)} €</span>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setEditingItems(null)}>
                          Atšaukti
                        </Button>
                        <Button size="sm" onClick={handleSaveItems} disabled={isSaving}>
                          {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                          Išsaugoti
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-semibold">Eilutės</Label>
                      {invoice.status === 'draft' && (
                        <Button variant="outline" size="sm" onClick={startEditing}>
                          <Edit className="h-3 w-3 mr-1" /> Redaguoti
                        </Button>
                      )}
                    </div>
                    <div className="text-xs space-y-1">
                      {invoice.items.map((item: InvoiceItem, i: number) => (
                        <div key={i} className="flex justify-between items-center py-1 border-b last:border-0">
                          <span className="flex-1 truncate mr-2">{item.name}</span>
                          <span className="text-muted-foreground mr-2">{item.qty} × {Number(item.price).toFixed(2)}</span>
                          <span className="font-medium">{Number(item.total).toFixed(2)} €</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Separator />

                <div className="flex gap-2 flex-wrap">
                  <Button variant="outline" size="sm" onClick={handlePreview}>
                    <Eye className="h-4 w-4 mr-1" /> Peržiūrėti
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDownload}>
                    <Download className="h-4 w-4 mr-1" /> Atsisiųsti
                  </Button>
                  {invoice.status === 'draft' && (
                    <Button variant="outline" size="sm" onClick={handleRegeneratePdf} disabled={isRegenerating}>
                      {isRegenerating ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <RotateCcw className="h-4 w-4 mr-1" />}
                      Pergeneruoti PDF
                    </Button>
                  )}
                </div>

                {invoice.status === 'draft' && (
                  <Button onClick={handleConfirm} disabled={isConfirming || !!editingItems} className="w-full" variant="secondary">
                    {isConfirming ? (
                      <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Tvirtinama...</>
                    ) : (
                      <><CheckCircle className="h-4 w-4 mr-2" /> Patvirtinti sąskaitą</>
                    )}
                  </Button>
                )}

                {(invoice.status === 'confirmed' || invoice.status === 'sent') && (
                  <Button onClick={handleSend} disabled={isSending} className="w-full">
                    {isSending ? (
                      <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Siunčiama...</>
                    ) : (
                      <><Send className="h-4 w-4 mr-2" /> {invoice.status === 'sent' ? 'Siųsti pakartotinai' : 'Siųsti klientui'}</>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

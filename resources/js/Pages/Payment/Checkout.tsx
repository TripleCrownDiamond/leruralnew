import AdSpace from '@/Components/AdSpace';
import FileUpload from '@/Components/FileUpload';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/Components/ui/radio-group';
import MainLayout from '@/Layouts/MainLayout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import {
    Banknote,
    Check,
    CheckCircle2,
    Copy,
    CreditCard,
    ShieldCheck,
    Smartphone,
    Sparkles,
    Upload,
} from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useKKiaPay } from 'kkiapay-react';

interface CheckoutProps {
    type: 'article' | 'subscription' | 'paper';
    item: any;
    amount: number;
    name: string;
    gateways: Array<{
        id: string;
        name: string;
        logo: string;
        config?: Record<string, any>;
        type: 'manual' | 'automatic';
        description?: string;
        instructions?: string;
    }>;
    original_amount?: number;
    discount_amount?: number;
    requested_promo_code?: string | null;
    applied_promo?: {
        code: string;
        name?: string | null;
        description?: string | null;
        discount_type: 'percent' | 'fixed';
        discount_value: number;
    } | null;
    promo_error?: string | null;
}

export default function Checkout({ type, item, amount, name, gateways, original_amount, discount_amount = 0, requested_promo_code, applied_promo, promo_error }: CheckoutProps) {
    const { props } = usePage<any>();
    const user = props.auth.user;
    const flashError = props.flash?.error as string | undefined;
    const checkoutItemId = item?.slug ?? item?.id ?? null;

    const [selectedGateway, setSelectedGateway] = useState<string>(gateways.length > 0 ? gateways[0].id : 'manual');
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [promoCodeInput, setPromoCodeInput] = useState(requested_promo_code ?? applied_promo?.code ?? '');
    const [copiedPaymentNumber, setCopiedPaymentNumber] = useState(false);
    const [applyingPromo, setApplyingPromo] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        type,
        item_id: checkoutItemId,
        gateway: gateways.length > 0 ? gateways[0].id : 'manual',
        proof_file: null as File | null,
        phone_number: '',
        transaction_id: '',
        promo_code: requested_promo_code ?? '',
    });

    const { openKkiapayWidget, addKkiapayListener, removeKkiapayListener } = useKKiaPay();

    const selectedGatewayData = useMemo(
        () => gateways.find((gateway) => gateway.id === selectedGateway),
        [gateways, selectedGateway],
    );

    const isManualGateway = selectedGatewayData?.type === 'manual';
    const isAutomaticGateway = selectedGatewayData?.type === 'automatic';
    const isCashGateway = selectedGateway === 'especes' || selectedGateway === 'cash';
    const requiresProofForGateway = Boolean(isManualGateway && !isCashGateway);
    const isActionLocked = processing || isUploading || applyingPromo;

    const successHandler = useCallback((response: any) => {
        if (response.status !== 'SUCCESS') {
            alert(`Paiement echoue: ${response.message || 'Erreur inconnue'}`);
            return;
        }

        post(route('payment.process'), {
            type,
            item_id: checkoutItemId,
            gateway: 'kkiapay',
            proof_file: null,
            phone_number: response.phone || '',
            transaction_id: response.transactionId,
            promo_code: data.promo_code || undefined,
        } as any);
    }, [checkoutItemId, data.promo_code, post, type]);

    const failureHandler = useCallback((error: any) => {
        const reason = error?.message || 'Erreur inconnue';
        router.get(route('payment.failed'), { reason: `Paiement echoue: ${reason}` });
    }, []);

    useEffect(() => {
        if (selectedGateway !== 'kkiapay') {
            return;
        }

        addKkiapayListener('success', successHandler);
        addKkiapayListener('failed', failureHandler);

        return () => {
            removeKkiapayListener('success');
            removeKkiapayListener('failed');
        };
    }, [addKkiapayListener, failureHandler, removeKkiapayListener, selectedGateway, successHandler]);
    useEffect(() => {
        const next = requested_promo_code ?? applied_promo?.code ?? '';
        setPromoCodeInput(next);
        setData('promo_code', next);
    }, [applied_promo?.code, requested_promo_code, setData]);

    const handleGatewayChange = (gatewayId: string) => {
        if (isActionLocked) {
            return;
        }
        setSelectedGateway(gatewayId);
        setData('gateway', gatewayId);
        if (gatewayId === 'especes' || gatewayId === 'cash') {
            setData('proof_file', null);
        }
    };

    const handleApplyPromo = () => {
        if (isActionLocked) {
            return;
        }
        const nextPromo = promoCodeInput.trim().toUpperCase();
        setApplyingPromo(true);
        router.get(route('payment.checkout'), {
            type,
            id: item.slug ?? item.id,
            promo_code: nextPromo || undefined,
        }, {
            onFinish: () => setApplyingPromo(false),
        });
    };

    const handleRemovePromo = () => {
        if (isActionLocked) {
            return;
        }
        setPromoCodeInput('');
        setData('promo_code', '');
        router.get(route('payment.checkout'), {
            type,
            id: item.slug ?? item.id,
        });
    };

    const copyPaymentNumber = async () => {
        if (isActionLocked) {
            return;
        }
        if (!paymentNumber) {
            return;
        }

        try {
            await navigator.clipboard.writeText(paymentNumber);
            setCopiedPaymentNumber(true);
            setTimeout(() => setCopiedPaymentNumber(false), 1400);
        } catch {
            setCopiedPaymentNumber(false);
        }
    };

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();

        if (!checkoutItemId) {
            alert('Article ou abonnement introuvable. Rechargez la page puis recommencez.');
            return;
        }

        if (!selectedGatewayData) {
            alert('Moyen de paiement non trouve.');
            return;
        }

        if (isAutomaticGateway) {
            if (selectedGateway === 'kkiapay') {
                const apiKey = selectedGatewayData.config?.public_key || import.meta.env.VITE_KKIAPAY_PUBLIC_KEY || '';

                if (!apiKey) {
                    alert('Configuration Kkiapay manquante.');
                    return;
                }

                openKkiapayWidget({
                    amount,
                    api_key: apiKey,
                    sandbox: true,
                    email: user.email,
                    phone: user.phone || '97000000',
                    fullname: user.name,
                    data: `payment_${type}_${checkoutItemId ?? 'unknown'}`,
                });
                return;
            }

            const transactionId = `TXN-${Math.random().toString(36).slice(2, 11).toUpperCase()}`;
            router.post(route('payment.process'), {
                type,
                item_id: checkoutItemId,
                gateway: selectedGateway,
                proof_file: null,
                phone_number: data.phone_number,
                transaction_id: transactionId,
                promo_code: data.promo_code || undefined,
            });
            return;
        }

        if (requiresProofForGateway && !data.proof_file) {
            alert('Veuillez telecharger une preuve de paiement.');
            return;
        }

        setIsUploading(true);
        setUploadProgress(25);

        post(route('payment.process'), {
            forceFormData: true,
            onProgress: (progress) => {
                const percentage = progress?.percentage;
                if (typeof percentage === 'number') {
                    setUploadProgress(percentage);
                }
            },
            onSuccess: () => {
                setUploadProgress(100);
                setTimeout(() => {
                    setIsUploading(false);
                    setUploadProgress(0);
                }, 400);
            },
            onError: () => {
                setIsUploading(false);
                setUploadProgress(0);
            },
        });
    };

    const checkoutAdLocation = type === 'article'
        ? 'checkout_article_sidebar'
        : type === 'paper'
            ? 'checkout_paper_sidebar'
            : 'checkout_subscription_sidebar';

    const typeLabel = type === 'article' ? "Article a l'unite" : type === 'paper' ? 'Nos parutions' : 'Abonnement';
    const effectiveOriginalAmount = typeof original_amount === 'number' ? original_amount : amount;
    const hasDiscount = (discount_amount ?? 0) > 0;
    const totalAmount = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(amount);
    const originalAmountLabel = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(effectiveOriginalAmount);
    const discountAmountLabel = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(discount_amount ?? 0);
    const paymentNumber = String(
        selectedGatewayData?.config?.payment_number
        ?? selectedGatewayData?.config?.phone_number
        ?? selectedGatewayData?.config?.number
        ?? selectedGatewayData?.config?.account_number
        ?? '',
    ).trim();

    return (
        <MainLayout title={`Paiement - ${name}`}>
            <Head title={`Paiement - ${name}`} />

            <div className="min-h-screen bg-gradient-to-b from-[#f7f8f4] via-white to-[#eef2e7] py-8 dark:from-gray-950 dark:via-gray-950 dark:to-gray-900/80 sm:py-10">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-950 via-gray-900 to-primary/35 p-6 text-white shadow-[0_30px_80px_-30px_rgba(47,106,17,0.55)] sm:p-8">
                        <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-primary/30 blur-3xl" />
                        <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-emerald-500/20 blur-3xl" />
                        <div
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-0 opacity-[0.06]"
                            style={{
                                backgroundImage: 'radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)',
                                backgroundSize: '24px 24px',
                            }}
                        />

                        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                            <div className="min-w-0">
                                <div className="mb-4 flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.28em] text-white/70">
                                    <span className="relative flex h-1.5 w-1.5">
                                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-80" />
                                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
                                    </span>
                                    <span>LE RURAL</span>
                                    <span className="text-white/25">/</span>
                                    <span className="text-primary">Checkout</span>
                                </div>

                                <h1 className="font-heading text-3xl font-black uppercase leading-[0.95] tracking-tight text-white sm:text-4xl">
                                    Finaliser votre commande
                                </h1>
                                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/70 sm:text-base">
                                    Paiement securise SSL. Verifiez votre mode de paiement puis validez votre acces.
                                </p>
                            </div>

                            <div className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-white/80 backdrop-blur-sm">
                                <ShieldCheck className="h-4 w-4 text-primary" />
                                Transaction securisee
                            </div>
                        </div>
                    </section>

                    <div className="mt-7 grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
                        <section className="lg:col-span-8">
                            <div className="rounded-3xl border border-gray-200/70 bg-white/95 p-5 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.35)] backdrop-blur-sm dark:border-white/10 dark:bg-gray-900/75 sm:p-6">
                                {flashError && (
                                    <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700 dark:border-red-400/20 dark:bg-red-500/10 dark:text-red-200">
                                        {flashError}
                                    </div>
                                )}
                                <div className="mb-6 flex items-center justify-between gap-4 border-b border-gray-100 pb-4 dark:border-white/10">
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 dark:text-white/45">Etape 1</p>
                                        <h2 className="mt-1 text-lg font-black uppercase tracking-tight text-gray-900 dark:text-white">Moyen de paiement</h2>
                                    </div>
                                    <div className="rounded-full bg-gray-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-gray-600 dark:bg-white/10 dark:text-white/65">
                                        {gateways.length} options
                                    </div>
                                </div>

                                {gateways.length === 0 ? (
                                    <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50/80 p-5 text-sm text-gray-600 dark:border-white/15 dark:bg-white/5 dark:text-white/65">
                                        Aucun moyen de paiement configure.
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <RadioGroup
                                            value={selectedGateway}
                                            onValueChange={handleGatewayChange}
                                            className={`grid grid-cols-1 gap-3 sm:grid-cols-2 ${isActionLocked ? 'pointer-events-none opacity-60' : ''}`}
                                        >
                                            {gateways.map((gateway) => {
                                                const isSelected = selectedGateway === gateway.id;

                                                return (
                                                    <div key={gateway.id} className="relative">
                                                        <RadioGroupItem value={gateway.id} id={gateway.id} className="sr-only" />
                                                        <Label
                                                            htmlFor={gateway.id}
                                                            className={`group flex cursor-pointer items-center gap-3 rounded-2xl border p-3 transition-all sm:p-4 ${
                                                                isSelected
                                                                    ? 'border-primary/55 bg-primary/10 shadow-[0_16px_36px_-26px_rgba(47,106,17,0.75)]'
                                                                    : 'border-gray-200 bg-white hover:border-primary/35 hover:bg-primary/[0.03] dark:border-white/10 dark:bg-white/[0.02] dark:hover:border-primary/40'
                                                            }`}
                                                        >
                                                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 dark:border-white/10 dark:bg-white/10">
                                                                {gateway.logo ? (
                                                                    <img
                                                                        src={gateway.logo}
                                                                        alt={gateway.name}
                                                                        className="h-8 w-auto max-w-[96px] object-contain"
                                                                        onError={(e) => {
                                                                            e.currentTarget.style.display = 'none';
                                                                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                                                        }}
                                                                    />
                                                                ) : null}

                                                                <div className={`${gateway.logo ? 'hidden' : ''} flex h-7 w-7 items-center justify-center`}>
                                                                    {gateway.id === 'especes' || gateway.id === 'cash' ? (
                                                                        <Banknote className="h-5 w-5 text-gray-500 dark:text-white/70" />
                                                                    ) : gateway.id === 'manual' || gateway.id === 'mtn_momo' || gateway.id === 'flooz' ? (
                                                                        <Smartphone className="h-5 w-5 text-gray-500 dark:text-white/70" />
                                                                    ) : (
                                                                        <CreditCard className="h-5 w-5 text-gray-500 dark:text-white/70" />
                                                                    )}
                                                                </div>
                                                            </div>

                                                            <div className="min-w-0 flex-1">
                                                                <p className="truncate text-sm font-bold text-gray-900 dark:text-white">{gateway.name}</p>
                                                                <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-500 dark:text-white/45">
                                                                    {gateway.type === 'automatic' ? 'Automatique' : 'Validation manuelle'}
                                                                </p>
                                                            </div>

                                                            {isSelected && (
                                                                <div className="rounded-full bg-primary p-1 text-white shadow-lg shadow-primary/30">
                                                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                                                </div>
                                                            )}
                                                        </Label>
                                                    </div>
                                                );
                                            })}
                                        </RadioGroup>

                                        <div className="rounded-2xl border border-gray-200 bg-gray-50/80 p-4 dark:border-white/10 dark:bg-white/[0.03]">
                                            <div className="flex items-center justify-between gap-2">
                                                <Label htmlFor="promo_code" className="text-xs font-black uppercase tracking-[0.12em] text-gray-600 dark:text-white/60">
                                                    Code promo
                                                </Label>
                                                {applied_promo && (
                                                    <button
                                                        type="button"
                                                        onClick={handleRemovePromo}
                                                        disabled={isActionLocked}
                                                        className="text-[11px] font-bold text-primary hover:underline"
                                                    >
                                                        Retirer
                                                    </button>
                                                )}
                                            </div>

                                            <div className="mt-2 flex gap-2">
                                                <Input
                                                    id="promo_code"
                                                    value={promoCodeInput}
                                                    onChange={(e) => {
                                                        const value = e.target.value.toUpperCase();
                                                        setPromoCodeInput(value);
                                                        setData('promo_code', value);
                                                    }}
                                                    placeholder="Ex: LERURAL10"
                                                    className="h-11 rounded-xl border-gray-300 bg-white dark:border-white/15 dark:bg-white/5"
                                                    disabled={isActionLocked}
                                                />
                                                <Button
                                                    type="button"
                                                    onClick={handleApplyPromo}
                                                    className="h-11 rounded-xl px-4 text-[11px] font-black uppercase tracking-[0.12em]"
                                                    disabled={isActionLocked}
                                                >
                                                    {applyingPromo ? 'Application...' : 'Appliquer'}
                                                </Button>
                                            </div>

                                            {promo_error && !applied_promo && (
                                                <p className="mt-2 text-xs font-semibold text-red-600">{promo_error}</p>
                                            )}

                                            {applied_promo && (
                                                <p className="mt-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                                                    Code {applied_promo.code} applique ({applied_promo.discount_type === 'percent' ? `${applied_promo.discount_value}%` : `${applied_promo.discount_value} FCFA`}).
                                                </p>
                                            )}
                                        </div>

                                        {selectedGatewayData && isManualGateway && (
                                            <div className="rounded-2xl border border-gray-200 bg-gray-50/80 p-4 dark:border-white/10 dark:bg-white/[0.03] sm:p-5">
                                                <h3 className="mb-3 flex items-center gap-2 text-sm font-black uppercase tracking-[0.12em] text-gray-800 dark:text-white/90">
                                                    {isCashGateway ? <Banknote className="h-4 w-4" /> : <Upload className="h-4 w-4" />}
                                                    {isCashGateway ? `Paiement en especes - ${selectedGatewayData.name}` : `Preuve de paiement - ${selectedGatewayData.name}`}
                                                </h3>

                                                {selectedGatewayData.description && (
                                                    <div className="mb-3 rounded-xl border border-blue-100 bg-blue-50 p-3 text-sm text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-200">
                                                        {selectedGatewayData.description}
                                                    </div>
                                                )}

                                                {paymentNumber && (
                                                    <div className="mb-3 rounded-xl border border-primary/25 bg-primary/[0.08] p-3 dark:border-primary/30 dark:bg-primary/15">
                                                        <h4 className="mb-1 text-xs font-black uppercase tracking-[0.14em] text-primary">Numero de paiement</h4>
                                                        <div className="flex items-center justify-between gap-3">
                                                            <p className="text-base font-black tracking-wide text-gray-900 dark:text-white">{paymentNumber}</p>
                                                            <button
                                                                type="button"
                                                                onClick={copyPaymentNumber}
                                                                disabled={isActionLocked}
                                                                className="inline-flex items-center gap-1 rounded-full border border-primary/30 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-primary transition hover:bg-primary/10"
                                                            >
                                                                {copiedPaymentNumber ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                                                                {copiedPaymentNumber ? 'Copie' : 'Copier'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}

                                                {selectedGatewayData.instructions && (
                                                    <div className="mb-3 rounded-xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-400/20 dark:bg-amber-500/10">
                                                        <h4 className="mb-1 text-xs font-black uppercase tracking-[0.14em] text-amber-800 dark:text-amber-200">Instructions</h4>
                                                        <p className="whitespace-pre-line text-sm text-amber-700 dark:text-amber-100/90">
                                                            {selectedGatewayData.instructions}
                                                        </p>
                                                    </div>
                                                )}

                                                {isCashGateway && (
                                                    <div className="mb-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200">
                                                        Aucun justificatif obligatoire pour le paiement en especes. L'acces est active apres validation admin.
                                                    </div>
                                                )}

                                                <div className="space-y-4">
                                                    {!isCashGateway && (
                                                        <div>
                                                            <Label htmlFor="phone" className="text-xs font-black uppercase tracking-[0.12em] text-gray-600 dark:text-white/60">
                                                                Numero emetteur / contact
                                                            </Label>
                                                            <Input
                                                                id="phone"
                                                                placeholder="Ex: 97000000"
                                                                value={data.phone_number}
                                                                onChange={(e) => setData('phone_number', e.target.value)}
                                                                className="mt-2 h-11 rounded-xl border-gray-300 bg-white dark:border-white/15 dark:bg-white/5"
                                                                disabled={isActionLocked}
                                                            />
                                                            {errors.phone_number && <p className="mt-1 text-sm text-red-500">{errors.phone_number}</p>}
                                                        </div>
                                                    )}

                                                    {requiresProofForGateway && (
                                                        <div>
                                                            <Label htmlFor="proof" className="text-xs font-black uppercase tracking-[0.12em] text-gray-600 dark:text-white/60">
                                                                Capture d'ecran / Photo du recu
                                                            </Label>
                                                            <FileUpload
                                                                onFileSelect={(file) => setData('proof_file', file)}
                                                                selectedFile={data.proof_file}
                                                                onRemove={() => setData('proof_file', null)}
                                                                showProgress={isUploading}
                                                                uploadProgress={uploadProgress}
                                                                isUploading={isUploading}
                                                                disabled={isActionLocked}
                                                                accept="image/*,.pdf,.doc,.docx"
                                                                maxSize={5}
                                                                label="Preuve de paiement"
                                                                className="mt-2"
                                                            />
                                                            {errors.proof_file && <p className="mt-1 text-sm text-red-500">{errors.proof_file}</p>}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {selectedGatewayData && isAutomaticGateway && (
                                            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 dark:border-blue-500/20 dark:bg-blue-500/10">
                                                <p className="text-sm font-semibold text-blue-700 dark:text-blue-200">
                                                    Paiement automatique via {selectedGatewayData.name}
                                                </p>
                                                {selectedGatewayData.description && (
                                                    <p className="mt-1 text-sm text-blue-600 dark:text-blue-100/80">{selectedGatewayData.description}</p>
                                                )}
                                            </div>
                                        )}

                                        <Button
                                            type="submit"
                                            className="h-12 w-full rounded-xl text-sm font-black uppercase tracking-[0.12em] shadow-lg shadow-primary/25"
                                            disabled={isActionLocked}
                                        >
                                            {isActionLocked ? 'Traitement en cours...' : `Payer ${totalAmount}`}
                                        </Button>

                                        <p className="text-center text-[11px] font-medium text-gray-500 dark:text-white/45">
                                            En validant votre commande, vous acceptez les conditions generales de vente.
                                        </p>
                                    </form>
                                )}
                            </div>
                        </section>

                        <aside className="lg:col-span-4">
                            <div className="sticky top-24 space-y-4">
                                <div className="overflow-hidden rounded-3xl border border-gray-200/70 bg-white/95 p-5 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.35)] backdrop-blur-sm dark:border-white/10 dark:bg-gray-900/75 sm:p-6">
                                    <div className="mb-4 flex items-center justify-between">
                                        <h3 className="text-lg font-black uppercase tracking-tight text-gray-900 dark:text-white">Recapitulatif</h3>
                                        <div className="rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-gray-600 dark:bg-white/10 dark:text-white/60">
                                            {typeLabel}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="rounded-2xl border border-gray-200 bg-gray-50/80 p-4 dark:border-white/10 dark:bg-white/[0.03]">
                                            <p className="text-xs font-black uppercase tracking-[0.12em] text-gray-500 dark:text-white/45">Produit</p>
                                            <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">{name}</p>
                                        </div>

                                        <div className="rounded-2xl border border-primary/25 bg-primary/[0.08] p-4 dark:border-primary/30 dark:bg-primary/15">
                                            <p className="text-xs font-black uppercase tracking-[0.12em] text-primary/90">Total a payer</p>
                                            {hasDiscount && (
                                                <p className="mt-1 text-xs font-semibold text-gray-600 line-through dark:text-white/55">{originalAmountLabel}</p>
                                            )}
                                            <p className="mt-1 text-2xl font-black tracking-tight text-gray-900 dark:text-white">{totalAmount}</p>
                                            {hasDiscount && applied_promo && (
                                                <p className="mt-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                                                    -{discountAmountLabel} avec {applied_promo.code}
                                                </p>
                                            )}
                                        </div>

                                        {selectedGatewayData && (
                                            <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-white/10 dark:bg-white/[0.02]">
                                                <p className="text-xs font-black uppercase tracking-[0.12em] text-gray-500 dark:text-white/45">Mode choisi</p>
                                                <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">{selectedGatewayData.name}</p>
                                            </div>
                                        )}

                                        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-200">
                                            <div className="flex items-start gap-2">
                                                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
                                                <span>Paiement 100% securise avec suivi de transaction.</span>
                                            </div>
                                        </div>

                                        <div className="rounded-2xl border border-gray-200 bg-gray-50/80 p-3 text-xs font-semibold text-gray-600 dark:border-white/10 dark:bg-white/[0.03] dark:text-white/60">
                                            <div className="flex items-center gap-2">
                                                <Sparkles className="h-3.5 w-3.5 text-primary" />
                                                Assistance disponible en cas de besoin de verification.
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <AdSpace
                                    width="100%"
                                    height={220}
                                    locationId={checkoutAdLocation}
                                    label="Sponsor checkout"
                                    className="overflow-hidden rounded-3xl"
                                    hideWhenEmpty
                                />
                            </div>
                        </aside>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}













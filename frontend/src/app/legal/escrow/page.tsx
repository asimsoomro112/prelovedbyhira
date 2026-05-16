"use client";

import { CheckCircle2, ShieldCheck, AlertCircle, RefreshCw, Truck, Landmark } from "lucide-react";

export default function EscrowPolicy() {
  return (
    <div className="space-y-12">
      <section>
        <h2 className="text-3xl font-display font-bold mb-6">Neural Escrow Protection</h2>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
          At ReVault, we utilize a 2026-standard Neutral Escrow System. Your funds are never released directly to the seller until you have inspected and verified the luxury item's authenticity and condition.
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-12">
        <div className="p-8 rounded-[32px] bg-emerald-500/5 border border-emerald-500/10">
           <Landmark className="w-8 h-8 text-emerald-500 mb-4" />
           <h3 className="font-bold text-lg mb-2">Secured Deposits</h3>
           <p className="text-sm text-gray-500">Payments are held in a secure, non-interest-bearing escrow account monitored by our neural audit system.</p>
        </div>
        <div className="p-8 rounded-[32px] bg-gold-400/5 border border-gold-400/10">
           <Truck className="w-8 h-8 text-gold-400 mb-4" />
           <h3 className="font-bold text-lg mb-2">Verified Transit</h3>
           <p className="text-sm text-gray-500">Funds remain locked until our courier partner confirms successful delivery and the inspection window closes.</p>
        </div>
      </div>

      <section className="space-y-6">
        <h3 className="text-2xl font-bold flex items-center gap-3">
          <CheckCircle2 className="text-emerald-500" /> The Protection Flow
        </h3>
        <div className="space-y-4 border-l-2 border-gold-400/20 ml-3 pl-8">
           <div className="relative">
              <div className="absolute -left-[41px] top-1 w-4 h-4 rounded-full bg-gold-400 shadow-gold" />
              <h4 className="font-bold">1. Capital Commitment</h4>
              <p className="text-sm text-gray-500 mt-1">Buyer pays for the item. ReVault confirms receipt and notifies the seller to ship.</p>
           </div>
           <div className="relative pt-8">
              <div className="absolute -left-[41px] top-9 w-4 h-4 rounded-full bg-gold-400 shadow-gold" />
              <h4 className="font-bold">2. Authenticity Window</h4>
              <p className="text-sm text-gray-500 mt-1">Once delivered, the buyer has 48 hours to inspect the item for authenticity and condition.</p>
           </div>
           <div className="relative pt-8">
              <div className="absolute -left-[41px] top-9 w-4 h-4 rounded-full bg-gold-400 shadow-gold" />
              <h4 className="font-bold">3. Final Settlement</h4>
              <p className="text-sm text-gray-500 mt-1">After confirmation or the window expiry, funds are released to the seller's wallet.</p>
           </div>
        </div>
      </section>

      <section className="p-8 rounded-[32px] bg-red-500/5 border border-red-500/10 flex gap-6 items-start">
         <AlertCircle className="w-8 h-8 text-red-500 shrink-0" />
         <div>
            <h4 className="font-bold text-red-500">Dispute Resolution</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              If an item is not as described, our neutral mediators will intervene. Funds stay in escrow until the dispute is settled via our 2026 Dispute Framework.
            </p>
         </div>
      </section>
    </div>
  );
}

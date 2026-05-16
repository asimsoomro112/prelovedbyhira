"use client";

import { Gavel, CheckSquare, AlertTriangle, Scale, Hammer, Award } from "lucide-react";

export default function TermsOfService() {
  return (
    <div className="space-y-12">
      <section>
        <h2 className="text-3xl font-display font-bold mb-6">Terms of Governance</h2>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
          Welcome to ReVault. By entering our vault, you agree to abide by the 2026 Luxury Trade Protocols. These terms ensure a civilized, secure, and authentic marketplace for all preloved connoisseurs.
        </p>
      </section>

      <section className="space-y-6">
        <h3 className="text-xl font-bold flex items-center gap-3">
          <Award className="text-gold-400" /> 1. Authenticity Mandate
        </h3>
        <p className="text-sm text-gray-500 leading-relaxed pl-9">
          Selling counterfeit goods is a violation of international law and ReVault policy. Sellers found listing non-authentic items will face permanent ecosystem suspension and forfeiture of their escrowed funds.
        </p>
      </section>

      <section className="space-y-6">
        <h3 className="text-xl font-bold flex items-center gap-3">
          <Scale className="text-gold-400" /> 2. The Escrow Bond
        </h3>
        <p className="text-sm text-gray-500 leading-relaxed pl-9">
          All transactions must be processed through the ReVault Escrow System. Bypassing the system to trade directly ("Off-Platform Trading") voids all buyer and seller protections and results in immediate account deactivation.
        </p>
      </section>

      <section className="space-y-6">
        <h3 className="text-xl font-bold flex items-center gap-3">
          <Hammer className="text-gold-400" /> 3. Marketplace Commission
        </h3>
        <p className="text-sm text-gray-500 leading-relaxed pl-9">
          ReVault retains a standard concierge fee from every successful sale. This fee powers our neural authentication, escrow security, and 24/7 support infrastructure. Current rates are visible in your Seller Portal.
        </p>
      </section>

      <section className="p-8 rounded-[32px] bg-gold-400/5 border border-gold-400/20">
         <h4 className="font-bold flex items-center gap-2 mb-4 text-gold-400">
            <AlertTriangle className="w-5 h-5" /> Risk Acknowledgement
         </h4>
         <p className="text-xs text-gray-500 leading-relaxed">
           While ReVault provides the ultimate protection framework, users acknowledge that luxury trading involves inherent risks. ReVault is a facilitator and mediator, not the direct owner of listed preloved items.
         </p>
      </section>

      <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] pt-10">
         <Gavel className="w-4 h-4" /> Last Updated: May 2026 • ReVault Governance Board
      </div>
    </div>
  );
}

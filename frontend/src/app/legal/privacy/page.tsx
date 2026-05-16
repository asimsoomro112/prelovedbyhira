"use client";

import { Lock, Eye, ShieldCheck, Database, Globe, UserCheck } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="space-y-12">
      <section>
        <h2 className="text-3xl font-display font-bold mb-6">Privacy Protocol 2026</h2>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
          At ReVault, your digital luxury footprint is handled with the highest level of encryption. We believe privacy is the ultimate luxury. Our protocols are designed to protect your identity while facilitating seamless global trade.
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-12">
        <PrivacyStat icon={<Lock />} title="End-to-End" desc="Encrypted data transmission" />
        <PrivacyStat icon={<Database />} title="Zero-Knowledge" desc="Sensitive data isolation" />
        <PrivacyStat icon={<UserCheck />} title="Verified Only" desc="No unauthorized access" />
      </div>

      <section className="space-y-8">
        <div className="glass-ultra p-8 rounded-[32px] border border-gold-400/10">
           <h3 className="text-xl font-bold mb-4 flex items-center gap-3">
             <Eye className="text-gold-400" /> Data Collection
           </h3>
           <ul className="space-y-4 text-sm text-gray-500 list-disc ml-6">
             <li>Identity markers verified through our neural authentication system.</li>
             <li>Transaction history secured within the ReVault private ledger.</li>
             <li>Communication logs encrypted for dispute resolution purposes only.</li>
           </ul>
        </div>

        <div className="glass-ultra p-8 rounded-[32px] border border-gold-400/10">
           <h3 className="text-xl font-bold mb-4 flex items-center gap-3">
             <ShieldCheck className="text-emerald-500" /> Third-Party Disclosure
           </h3>
           <p className="text-sm text-gray-500 leading-relaxed">
             We do not sell, trade, or otherwise transfer your luxury browsing habits to outside parties. This excludes trusted third parties (Couriers/Banks) who assist us in operating our marketplace, so long as those parties agree to keep this information confidential.
           </p>
        </div>
      </section>

      <section>
        <h3 className="text-xl font-bold mb-4">Your Rights</h3>
        <p className="text-sm text-gray-500 leading-relaxed">
          Under the 2026 Digital Privacy Act, you have the right to request a full neural dump of your data or exercise your 'Right to be Forgotten' from the ReVault ecosystem at any time.
        </p>
      </section>
    </div>
  );
}

function PrivacyStat({ icon, title, desc }: any) {
  return (
    <div className="text-center p-6 bg-gold-400/5 rounded-[24px] border border-gold-400/10">
       <div className="w-12 h-12 bg-gold-400/10 text-gold-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
          {icon}
       </div>
       <h4 className="font-bold text-sm mb-1">{title}</h4>
       <p className="text-[10px] text-gray-400 uppercase tracking-widest font-medium">{desc}</p>
    </div>
  );
}

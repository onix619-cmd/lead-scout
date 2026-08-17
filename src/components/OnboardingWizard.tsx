import React, { useState, useEffect } from "react";

export function OnboardingWizard({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(1);
  const [vercelToken, setVercelToken] = useState("");
  const [imgbbKey, setImgbbKey] = useState("");
  const [keyword, setKeyword] = useState("restaurant");
  const [location, setLocation] = useState("Paris, France");

  useEffect(() => {
    // Check if already configured
    const savedVercel = localStorage.getItem("leadmax_vercel_token");
    const savedImgbb = localStorage.getItem("leadmax_imgbb_key");
    const completed = localStorage.getItem("leadmax_onboarding_done");
    if (completed === "true") {
      onComplete();
    } else if (savedVercel && savedImgbb) {
      setStep(4); // Jump to campaign creation if keys exist
    }
  }, [onComplete]);

  const handleFinish = () => {
    localStorage.setItem("leadmax_vercel_token", vercelToken);
    localStorage.setItem("leadmax_imgbb_key", imgbbKey);
    localStorage.setItem("leadmax_onboarding_done", "true");
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-xl bg-[#141a23] border border-white/10 rounded-3xl shadow-2xl overflow-hidden text-white p-8 space-y-6">
        
        {/* Progress Bar & Header */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-neutral-400 font-semibold tracking-wider">
            <span className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-emerald-500 text-black font-extrabold flex items-center justify-center text-xs">LM</span>
              ÉTAPE {step} SUR 6
            </span>
            <span>{Math.round((step / 6) * 100)}%</span>
          </div>
          <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full transition-all duration-300"
              style={{ width: `${(step / 6) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Step 1: Welcome */}
        {step === 1 && (
          <div className="space-y-6 text-center py-4">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto text-3xl shadow-lg border border-emerald-500/30">
              ⚡
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight">Bienvenue sur LeadMax</h2>
              <p className="text-neutral-400 text-sm max-w-md mx-auto">
                Votre outil tout-en-un pour trouver des entreprises locales sur Google Maps, générer de superbes pages d&apos;accueil IA et conclure plus d&apos;affaires.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs text-neutral-300 space-y-1">
              <p className="font-semibold text-white">LeadMax par Motez Hadj Salem — Licence à vie</p>
              <p className="text-neutral-400">Paiement unique. Utilisez-le ou monétisez-le librement.</p>
              <div className="flex justify-center gap-4 pt-2 text-emerald-400 font-medium">
                <span>Facebook</span>
                <span>Instagram</span>
                <span>TikTok</span>
              </div>
            </div>
            <div className="flex justify-between pt-4">
              <button
                disabled
                className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-white/5 text-neutral-500 cursor-not-allowed"
              >
                Retour
              </button>
              <button
                onClick={() => setStep(2)}
                className="px-8 py-3 rounded-xl text-sm font-bold bg-emerald-500 hover:bg-emerald-400 text-black shadow-lg shadow-emerald-500/20 transition-all"
              >
                Commencer
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Vercel Token */}
        {step === 2 && (
          <div className="space-y-6 py-2">
            <div className="space-y-1">
              <h2 className="text-xl font-bold">Jeton Vercel</h2>
              <p className="text-neutral-400 text-xs">
                Un jeton Vercel permet à LeadMax de déployer des sites Web automatiquement. C&apos;est gratuit et prend 2 minutes.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs text-neutral-300 space-y-2">
              <p>1. Allez sur <strong className="text-white">vercel.com/account/tokens</strong> et connectez-vous</p>
              <p>2. Cliquez sur &quot;Create&quot; et nommez-le &quot;LeadMax&quot;</p>
              <p>3. Choisissez la portée de votre compte, puis cliquez sur &quot;Create&quot;</p>
              <p>4. Copiez le jeton généré et collez-le ci-dessous</p>
              <a
                href="https://vercel.com/account/tokens"
                target="_blank"
                rel="noreferrer"
                className="inline-block text-emerald-400 underline font-semibold pt-1"
              >
                ↗ Ouvrir la page des jetons Vercel
              </a>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Jeton Vercel</label>
              <input
                type="password"
                value={vercelToken}
                onChange={(e) => setVercelToken(e.target.value)}
                placeholder="vcp_..."
                className="w-full bg-black/40 border border-white/20 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div className="flex justify-between pt-2">
              <button
                onClick={() => setStep(1)}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white"
              >
                Retour
              </button>
              <button
                onClick={() => setStep(3)}
                className="px-8 py-3 rounded-xl text-sm font-bold bg-emerald-500 hover:bg-emerald-400 text-black shadow-lg shadow-emerald-500/20 transition-all"
              >
                Suivant
              </button>
            </div>
          </div>
        )}

        {/* Step 3: ImgBB API Key */}
        {step === 3 && (
          <div className="space-y-6 py-2">
            <div className="space-y-1">
              <h2 className="text-xl font-bold">Clé API ImgBB</h2>
              <p className="text-neutral-400 text-xs">
                ImgBB héberge les images que vous téléchargez. Obtenez une clé API gratuite pour activer le téléchargement d&apos;images.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs text-neutral-300 space-y-2">
              <p>1. Allez sur <strong className="text-white">api.imgbb.com</strong> et inscrivez-vous ou connectez-vous</p>
              <p>2. Cliquez sur &quot;Get API Key&quot; et copiez la clé affichée</p>
              <p>3. Collez-la ci-dessous (gratuit : ~centaines d&apos;uploads/jour, 32 Mo max)</p>
              <a
                href="https://api.imgbb.com/"
                target="_blank"
                rel="noreferrer"
                className="inline-block text-emerald-400 underline font-semibold pt-1"
              >
                ↗ Ouvrir la page API ImgBB
              </a>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Clé API ImgBB</label>
              <input
                type="password"
                value={imgbbKey}
                onChange={(e) => setImgbbKey(e.target.value)}
                placeholder="XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                className="w-full bg-black/40 border border-white/20 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div className="flex justify-between pt-2">
              <button
                onClick={() => setStep(2)}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white"
              >
                Retour
              </button>
              <button
                onClick={() => setStep(4)}
                className="px-8 py-3 rounded-xl text-sm font-bold bg-emerald-500 hover:bg-emerald-400 text-black shadow-lg shadow-emerald-500/20 transition-all"
              >
                Suivant
              </button>
            </div>
          </div>
        )}

        {/* Step 4: First Campaign Creation */}
        {step === 4 && (
          <div className="space-y-6 py-2">
            <div className="space-y-1">
              <h2 className="text-xl font-bold">Créez votre première campagne</h2>
              <p className="text-neutral-400 text-xs">
                Une campagne est une recherche d&apos;entreprises sur Google Maps. Entrez un mot-clé et un lieu pour commencer.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Mot-clé</label>
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="ex. Dentiste"
                  className="w-full bg-black/40 border border-white/20 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Lieu / Région</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="ex. Paris, France"
                  className="w-full bg-black/40 border border-white/20 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <p className="text-xs text-neutral-500 italic">
              💡 Essayez une catégorie d&apos;entreprise populaire dans votre région. Les entreprises bien notées convertissent le mieux !
            </p>

            <div className="flex justify-between pt-2">
              <button
                onClick={() => setStep(3)}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white"
              >
                Retour
              </button>
              <button
                onClick={() => setStep(5)}
                className="px-8 py-3 rounded-xl text-sm font-bold bg-emerald-500 hover:bg-emerald-400 text-black shadow-lg shadow-emerald-500/20 transition-all"
              >
                Créer la campagne
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Campaign Preview / Running simulation */}
        {step === 5 && (
          <div className="space-y-6 text-center py-6">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto text-3xl animate-spin border-2 border-emerald-500 border-t-transparent">
              🌐
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold">Recherche en cours...</h2>
              <p className="text-neutral-400 text-xs">
                Recherche de <strong className="text-white">{keyword}</strong> à <strong className="text-white">{location}</strong> via Google Maps.
              </p>
            </div>
            <button
              onClick={() => setStep(6)}
              className="px-8 py-3 rounded-xl text-sm font-bold bg-emerald-500 hover:bg-emerald-400 text-black shadow-lg shadow-emerald-500/20 transition-all"
            >
              Continuer vers le tableau de bord
            </button>
          </div>
        )}

        {/* Step 6: Success / Ready to go */}
        {step === 6 && (
          <div className="space-y-6 text-center py-4">
            <div className="w-16 h-16 bg-emerald-500 text-black rounded-full flex items-center justify-center mx-auto text-3xl font-extrabold shadow-lg shadow-emerald-500/30">
              ✓
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight">Vous êtes prêt !</h2>
              <p className="text-neutral-400 text-xs max-w-sm mx-auto">
                Vous avez désormais tout ce qu&apos;il faut pour générer des leads et conclure des affaires.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-left text-xs space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-medium">
                <span>✓</span> Jeton Vercel configuré — les sites se déploient automatiquement
              </div>
              <div className="flex items-center gap-2 text-emerald-400 font-medium">
                <span>✓</span> Clé ImgBB configurée — les images se téléchargent facilement
              </div>
              <div className="flex items-center gap-2 text-emerald-400 font-medium">
                <span>✓</span> Première campagne créée — leads prêts à être contactés
              </div>
            </div>

            <div className="flex justify-between pt-2">
              <button
                onClick={() => setStep(5)}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white"
              >
                Retour
              </button>
              <button
                onClick={handleFinish}
                className="px-8 py-3.5 rounded-xl text-base font-bold bg-emerald-500 hover:bg-emerald-400 text-black shadow-xl shadow-emerald-500/20 transition-all"
              >
                Je suis prêt ! 🚀
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

import { getServerLocale } from "@/lib/server-locale";

export default async function PrivacyPage() {
  const locale = await getServerLocale();

  return (
    <div className="card p-6 md:p-8">
      <h1 className="section-title m-0 text-4xl font-black text-slate-900">Privacy Policy</h1>
      <div className="mt-5 space-y-4 text-base font-bold leading-7 text-slate-600">
        {locale === "it" ? (
          <>
            <p className="m-0">
              Questa versione pilota raccoglie solo i dati essenziali per far funzionare l&apos;esperienza didattica: profilo genitore, profili bambino, progressi, risultati e preferenze di utilizzo.
            </p>
            <p className="m-0">
              I dati vengono salvati nel browser e, quando l&apos;utente accede, anche nell&apos;account dell&apos;app per mantenere sincronizzati progressi e dashboard.
            </p>
            <p className="m-0">
              Prima della diffusione pubblica definitiva saranno pubblicati riferimenti completi su tempi di conservazione, diritti dell&apos;interessato e contatti privacy del progetto.
            </p>
            <p className="m-0">
              Per questa fase pilota, le richieste relative alla privacy devono essere indirizzate al referente scolastico o al coordinamento del progetto.
            </p>
          </>
        ) : (
          <>
            <p className="m-0">
              This pilot version collects only the essential data needed to support the learning experience: parent profile, child profiles, progress, results and usage preferences.
            </p>
            <p className="m-0">
              Data is stored in the browser and, when the user logs in, also in the app account so progress and dashboards remain in sync.
            </p>
            <p className="m-0">
              Before the final public release, full information about retention periods, data subject rights and privacy contacts for the project will be published.
            </p>
            <p className="m-0">
              During this pilot phase, privacy-related requests should be addressed to the school contact person or the project coordination team.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

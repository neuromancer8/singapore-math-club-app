import { getServerLocale } from "@/lib/server-locale";

export default async function TerminiPage() {
  const locale = await getServerLocale();

  return (
    <div className="card p-6 md:p-8">
      <h1 className="section-title m-0 text-4xl font-black text-slate-900">{locale === "it" ? "Termini di servizio" : "Terms of service"}</h1>
      <div className="mt-5 space-y-4 text-base font-bold leading-7 text-slate-600">
        {locale === "it" ? (
          <>
            <p className="m-0">
              Singapore Math Club è una web app educativa in fase pilota. I contenuti sono pensati per attività guidate da genitori, docenti o referenti del progetto.
            </p>
            <p className="m-0">
              L&apos;app non sostituisce la valutazione didattica scolastica e non deve essere usata come unico strumento di monitoraggio del percorso del bambino.
            </p>
            <p className="m-0">
              Le funzionalità in costruzione possono cambiare nel tempo. Prima della pubblicazione definitiva saranno aggiunte indicazioni complete su supporto, responsabilità e contatti di servizio.
            </p>
            <p className="m-0">
              In caso di dubbi sull&apos;uso della piattaforma, il riferimento operativo per questa fase resta il referente del progetto pilota.
            </p>
          </>
        ) : (
          <>
            <p className="m-0">
              Singapore Math Club is an educational web app in a pilot phase. The content is designed for guided use by parents, teachers or project coordinators.
            </p>
            <p className="m-0">
              The app does not replace school assessment and should not be used as the only tool to monitor a child&apos;s learning path.
            </p>
            <p className="m-0">
              Features that are still being developed may change over time. Before the final release, full details about support, responsibilities and service contacts will be added.
            </p>
            <p className="m-0">
              If there are any doubts about how to use the platform, the operational reference for this pilot phase remains the project contact person.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

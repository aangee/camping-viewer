// La version de schéma que CETTE page sait lire.
//
// ⚠ Elle est volontairement LOCALE au viewer, et surtout pas livrée dans le contrat.
// Elle sert à détecter qu'une page ouverte depuis longtemps est plus vieille que le
// data.json qu'elle vient de recharger : si le studio l'écrivait dans le contrat en
// même temps que la donnée, les deux valeurs partiraient dans le même commit et ne
// pourraient plus jamais diverger — le bandeau ne se déclencherait plus.
//
// Elle doit être montée à la main quand le producteur monte la sienne
// (app-admin : @aangee/cottet-schema, SCHEMA_VERSIONS.viewer).
export const SCHEMA_VERSION_VIEWER = 3

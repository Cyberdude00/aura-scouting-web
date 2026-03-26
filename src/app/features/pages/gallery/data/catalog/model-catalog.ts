import { ScoutingModel } from '../scouting-model.types';
import { slugifyValue } from '../../utils';

import { adan } from '../models/boys/adan.data';
import { franMazzei } from '../models/boys/fran-mazzei.data';
import { santiagoZezular } from '../models/boys/santiago-zezular.data';
import { santiagoPoggi } from '../models/boys/santiago-poggi.data';
import { salihTopcouglu } from '../models/boys/salih-topcouglu.data';
import { maximo } from '../models/boys/maximo.data';
import { manuLlofrein } from '../models/boys/manu-llofrein.data';
import { lucasTarrago } from '../models/boys/lucas-tarrago.data';
import { emmanuel } from '../models/boys/emmanuel.data';
import { bernardoRomano } from '../models/boys/bernardo-romano.data';
import { lautaroRodriguez } from '../models/boys/lautaro-rodriguez.data';
import { nachoPerez } from '../models/boys/nacho-perez.data';
import { belisario } from '../models/boys/belisario.data';
import { laurencioLeal } from '../models/boys/laurencio-leal.data';
import { angelBret } from '../models/boys/angel-bret.data';
import { alanMarquez } from '../models/boys/alan-marquez.data';
import { joaquinGarcia } from '../models/boys/joaquin-garcia.data';
import { juanToffalo } from '../models/boys/juan-toffalo.data';

import { zoe } from '../models/girls/zoe.data';
import { moana } from '../models/girls/moana.data';
import { victoria } from '../models/girls/victoria.data';
import { pilar } from '../models/girls/pilar.data';
import { mafer } from '../models/girls/mafer.data';
import { lucianaImoberdorf } from '../models/girls/luciana-imoberdorf.data';
import { isabelDeutsch } from '../models/girls/isabel-deutsch.data';
import { genesis } from '../models/girls/genesis.data';
import { felicitas } from '../models/girls/felicitas.data';
import { eva } from '../models/girls/eva.data';
import { eugeniaLagrenade } from '../models/girls/eugenia-lagrenade.data';
import { emiliaBryan } from '../models/girls/emilia-bryan.data';
import { elina } from '../models/girls/elina.data';
import { dogaBursali } from '../models/girls/doga-bursali.data';
import { aliciaVallecilla } from '../models/girls/alicia-vallecilla.data';
import { agosMartinez } from '../models/girls/agos-martinez.data';
import { marianaArias } from '../models/girls/mariana-arias.data';
import { antonella } from '../models/girls/antonella.data';

const sourceModels: ScoutingModel[] = [
  franMazzei,
  adan,
  santiagoZezular,
  santiagoPoggi,
  salihTopcouglu,
  maximo,
  manuLlofrein,
  lucasTarrago,
  emmanuel,
  bernardoRomano,
  lautaroRodriguez,
  belisario,
  laurencioLeal,
  angelBret,
  alanMarquez,
  joaquinGarcia,
  juanToffalo,
  nachoPerez,
  zoe,
  victoria,
  pilar,
  moana,
  mafer,
  lucianaImoberdorf,
  isabelDeutsch,
  genesis,
  felicitas,
  eva,
  eugeniaLagrenade,
  emiliaBryan,
  elina,
  dogaBursali,
  aliciaVallecilla,
  agosMartinez,
  marianaArias,
  antonella,
];

export const modelCatalog: Record<string, ScoutingModel> = sourceModels.reduce((acc, model) => {
  acc[slugifyValue(model.name)] = model;
  return acc;
}, {} as Record<string, ScoutingModel>);

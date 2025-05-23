import { getTypesForLanguage } from '@code4recovery/spec';

export const nl: Translation = {
  add_to_calendar: 'Toevoegen aan agenda',
  address: 'Addres',
  appointment: 'Afspraak',
  back_to_meetings: 'Terug naar Meetings',
  collapse: 'Instorting',
  contact_email: 'E-mail %contact%',
  contact_text: 'Tekst %contact%',
  contribute_with: 'Bijdragen aan %service%',
  days: {
    friday: 'Vrijdag',
    monday: 'Maandag',
    saturday: 'Zaterdag',
    sunday: 'Zondag',
    thursday: 'Donderdag',
    tuesday: 'Dinsdag',
    wednesday: 'Woensdag',
  },
  distance: 'Afstand',
  distance_any: 'Elke Afstand',
  distance_km: '%distance% km',
  distance_mi: '%distance% mi',
  email_edit_url: 'Wijzig URL: %url%',
  email_public_url: 'Publieke URL: %url%',
  email_subject: 'Meeting Feedback: %name%',
  errors: {
    geocoding: `Kon ‘%address%’ niet vinden, kies een andere locatie.`,
    geolocation: `Kon uw locatie niet vinden. Controleer uw browserinstellingen.`,
  },
  evening: 'Avond',
  expand: 'Uitbreiden',
  feedback: 'Update Meeting Info',
  get_directions: 'Krijg Routebeschrijving',
  in_progress_single: '1 meeting bezig',
  in_progress_multiple: '%count% meetings bezig',
  km: 'km',
  location: 'Locatie',
  location_group: 'Locatie / Groep',
  match_single: '1 resultaat',
  match_multiple: '%count% resultaten',
  meeting_information: 'Meeting Informatie',
  meetings: 'Meetings',
  mi: 'mi',
  midday: 'Middag',
  'modes': {
    location: 'Vlakbij Locatie',
    me: 'Vlakbij Me',
    search: 'Zoeken',
  },
  morning: 'Ochtend',
  name: 'Naam',
  no_results:
    'Er zijn geen meetings gevonden die aan de geselecteerde criteria voldoen.',
  not_found: 'Meeting niet gevonden.',
  night: 'Nacht',
  phone: 'Telefoon',
  provided_by: 'Deze lijst wordt aangeboden door:',
  region: 'Plaats',
  region_any: 'Overal',
  remove: 'Verwijder %filter%',
  seventh_tradition: 'Zevende Traditie',
  share: 'Deel',
  time: 'Tijd',
  time_any: 'Elke Tijd',
  title: {
    weekday: '%weekday%',
    time: '%time%',
    type: '%type%',
    meetings: '%meetings%',
    region: 'in %region%',
    search_with: 'met %search%',
    search_near: 'vlakbij %search%',
    distance: 'binnen %distance%',
  },
  type_any: 'Elk Type',
  type_descriptions: {
    C: 'Besloten vergaderingen zijn voor A.A. alleen voor leden, of voor degenen die een drankprobleem hebben en ‘het verlangen hebben om te stoppen met drinken’.',
    O: 'Er zijn open bijeenkomsten beschikbaar voor iedereen die geïnteresseerd is in het herstelprogramma van de Anonieme Alcoholisten van alcoholisme. Niet-alcoholisten kunnen als waarnemer open bijeenkomsten bijwonen.',
  },
  types: {
    ...getTypesForLanguage('nl'),
    active: 'Actief',
    inactive: 'Inactief',
    'in-person': 'Fysiek',
    online: 'Online',
    SPD: 'Spreker/Discussie',
  },
  unnamed_meeting: 'Naamloze meeting',
  updated: 'Bijgewerkt %updated%',
  views: {
    table: 'Lijst',
    map: 'Kaart',
  },
  weekday_any: 'Elke Dag',
};

import { getTypesForLanguage } from '@code4recovery/spec';
import { Translation } from '../types';

export const es: Translation = {
  add_to_calendar: 'Añadir al calendario',
  address: 'Dirección',
  appointment: 'Cita',
  back_to_meetings: 'Volver a las reuniones',
  contact_call: 'Llamar a %contact%',
  contact_email: 'Correo a %contact%',
  contribute_with: 'Contribuya con %service%',
  days: {
    friday: 'Viernes',
    monday: 'Lunes',
    saturday: 'Sábado',
    sunday: 'Domingo',
    thursday: 'Jueves',
    tuesday: 'Martes',
    wednesday: 'Miércoles',
  },
  distance: 'Distancia',
  distance_any: 'Cualquier distancia',
  distance_km: '%distance% km',
  distance_mi: '%distance% mi',
  email_edit_url: 'Editar URL: %url%',
  email_public_url: 'URL pública: %url%',
  email_subject: 'Comentarios de la reunión: %name%',
  evening: 'Noche',
  feedback: 'Actualizar la información de la reunión',
  get_directions: 'Obtener las direcciones',
  in_progress_single: '1 reunión en curso',
  in_progress_multiple: '%count% reuniones en curso',
  km: 'km',
  location: 'Ubicación',
  location_group: 'Ubicación / Grupo',
  match_single: '1 resultado',
  match_multiple: '%count% resultados',
  meeting_information: 'Información de la reunión',
  meetings: 'Reuniones',
  mi: 'mi',
  midday: 'Mediodía',
  modes: {
    location: 'Ubicación cercana',
    me: 'Cerca de mí',
    search: 'Buscar',
  },
  morning: 'Mañana',
  name: 'Nombre',
  no_results: 'No se encontraron reuniones que coincidieran con los criterios.',
  not_found: 'Reunión no encontrada.',
  night: 'Noche',
  phone: 'Teléfono',
  region: 'Región',
  region_any: 'Todos lados',
  remove: 'Quitar %filter%',
  seventh_tradition: 'Séptima Tradición',
  share: 'Compartir',
  time: 'Hora',
  time_any: 'Cualquier momento',
  title: {
    weekday: '%weekday%',
    time: '%time%',
    type: '%type%',
    meetings: '%meetings%',
    region: 'en %region%',
    search_with: 'con %search%',
    search_near: 'cerca de %search%',
    distance: 'dentro de %distance%',
  },
  type_any: 'Cualquier tipo',
  type_descriptions: {
    C: 'Las reuniones cerradas son para A.A. solo para miembros, o para aquellos que tienen un problema con la bebida y "desean dejar de beber".',
    O: 'Las reuniones abiertas están disponibles para cualquier persona interesada en el programa de recuperación del alcoholismo de Alcohólicos Anónimos. Los no alcohólicos pueden asistir a reuniones abiertas como observadores.',
  },
  types: {
    ...getTypesForLanguage('es'),
    active: 'Activo',
    inactive: 'Inactiva',
    'in-person': 'En persona',
    online: 'En Línea',
    SPD: 'Orador/Discusión',
  },
  unnamed_meeting: 'Reunión sin nombre',
  updated: 'Actualizado el %updated%',
  views: {
    table: 'Lista',
    map: 'Mapa',
  },
  weekday_any: 'Cualquier día',
};

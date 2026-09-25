import type { SelectOption } from './onboarding.types'

export const ONBOARDING_STEPS = [
  { number: 1, label: 'Negocio' },
  { number: 2, label: 'Canales' },
  { number: 3, label: 'Listo' },
]

export const SECTOR_OPTIONS: SelectOption[] = [
  { value: 'retail', label: 'Comercio minorista' },
  { value: 'ecommerce', label: 'Tienda online / Ecommerce' },
  { value: 'hospitality', label: 'Restauración y hostelería' },
  { value: 'beauty', label: 'Belleza y peluquería' },
  { value: 'health', label: 'Salud y bienestar' },
  {
    value: 'professional-services',
    label: 'Servicios profesionales (consultoría, legal, asesoría)',
  },
  { value: 'real-estate', label: 'Inmobiliaria' },
  { value: 'education', label: 'Educación y formación' },
  { value: 'fitness', label: 'Deporte y fitness' },
  { value: 'home-services', label: 'Servicios a domicilio (fontanería, limpieza, reformas)' },
  { value: 'events', label: 'Eventos y celebraciones' },
  { value: 'automotive', label: 'Automoción y talleres' },
  { value: 'other', label: 'Otro' },
]

export const COUNTRY_OPTIONS: SelectOption[] = [
  { value: 'ES', label: 'España' },
  { value: 'PT', label: 'Portugal' },
  { value: 'FR', label: 'Francia' },
  { value: 'IT', label: 'Italia' },
  { value: 'MX', label: 'México' },
  { value: 'AR', label: 'Argentina' },
  { value: 'CO', label: 'Colombia' },
  { value: 'CL', label: 'Chile' },
  { value: 'PE', label: 'Perú' },
  { value: 'US', label: 'Estados Unidos' },
  { value: 'OTHER', label: 'Otro' },
]

export const DESCRIPTION_MAX_LENGTH = 200

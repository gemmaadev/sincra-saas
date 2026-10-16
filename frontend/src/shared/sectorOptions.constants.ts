interface SectorOption {
  value: string
  label: string
}

export const SECTOR_OPTIONS: SectorOption[] = [
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

const APP_SECTIONS = new Set([
  'inbox',
  'clients',
  'orders',
  'calendar',
  'map',
  'stats',
  'team',
  'automations',
  'settings',
  'profile',
])

// Detail URLs such as /clients/:id belong to the business that was active when
// they were opened. After a switch, stay on the section so it refetches there.
export function routeAfterBusinessSwitch(pathname: string): string {
  const section = pathname.split('/').filter(Boolean)[0]

  if (section && APP_SECTIONS.has(section)) {
    return `/${section}`
  }

  return '/stats'
}

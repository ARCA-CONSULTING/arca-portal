export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(date))
}
export function formatTaille(bytes: number) {
  if (bytes < 1024) return bytes + ' o'
  if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + ' Ko'
  return (bytes / (1024 * 1024)).toFixed(1) + ' Mo'
}
export function statutColor(statut: string) {
  const colors: Record<string, string> = {
    'En attente': 'bg-yellow-100 text-yellow-800',
    'Pieces recues': 'bg-blue-100 text-blue-800',
    'Dossier complet': 'bg-green-100 text-green-800',
    'Valide': 'bg-gray-100 text-gray-800',
  }
  return colors[statut] || 'bg-gray-100 text-gray-600'
}
const EMAIL_STORAGE_KEY = 'hs_email_list'

export const exportEmailsToCSV = (): boolean => {
  const storedEmails = localStorage.getItem(EMAIL_STORAGE_KEY)

  if (!storedEmails) {
    return false
  }

  let emails: string[] = []

  try {
    const parsedEmails = JSON.parse(storedEmails)
    emails = Array.isArray(parsedEmails)
      ? parsedEmails.filter((item): item is string => typeof item === 'string')
      : []
  } catch {
    return false
  }

  if (emails.length === 0) {
    return false
  }

  const csvRows = ['email', ...emails]
  const csvContent = `${csvRows.join('\n')}\n`
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' })
  const downloadUrl = URL.createObjectURL(blob)
  const downloadLink = document.createElement('a')

  downloadLink.href = downloadUrl
  downloadLink.download = 'emails.csv'
  downloadLink.rel = 'noopener noreferrer'
  document.body.appendChild(downloadLink)
  downloadLink.click()
  document.body.removeChild(downloadLink)
  URL.revokeObjectURL(downloadUrl)

  // eslint-disable-next-line no-console
  console.log('Exported emails:', emails)

  return true
}

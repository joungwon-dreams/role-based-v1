/**
 * DeleteAlert Component
 * 재사용 가능한 삭제 확인 다이얼로그
 *
 * Reusable delete confirmation dialog.
 * 재사용 가능한 삭제 확인 다이얼로그입니다.
 */

'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useLocale } from '@/lib/i18n'

interface DeleteAlertProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  title?: string
  description?: string
  itemName?: string
  isLoading?: boolean
}

/**
 * Reusable delete confirmation dialog
 * - Used for all delete operations
 * - Consistent confirmation process
 * - Prevents accidental deletions
 *
 * 재사용 가능한 삭제 확인 다이얼로그
 * - 모든 삭제 작업에 사용
 * - 일관된 확인 프로세스
 * - 실수로 인한 삭제 방지
 */
export function DeleteAlert({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  itemName,
  isLoading = false,
}: DeleteAlertProps) {
  const { t } = useLocale()

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title || t('common.deleteConfirm.title')}</AlertDialogTitle>
          <AlertDialogDescription>
            {description ||
              (itemName
                ? t('common.deleteConfirm.descriptionWithName', { name: itemName })
                : t('common.deleteConfirm.description'))}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>{t('common.cancel')}</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              onConfirm()
            }}
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading ? t('common.deleting') : t('common.delete')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

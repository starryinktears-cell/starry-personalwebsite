import { createContext, useContext, type ReactNode } from 'react'

export const PreviewEditing = createContext(false)
export function EditableContent({ field, children }: { field: string; children: ReactNode }) {
  const editing = useContext(PreviewEditing)
  return editing ? <span data-edit-key={field} role="button" tabIndex={0} title="点击编辑此内容">{children}</span> : <>{children}</>
}

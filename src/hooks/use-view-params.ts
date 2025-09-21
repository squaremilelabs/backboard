import { DEFAULT_VIEW_PARAMS, ViewParams } from "@/types/views"
import { useSessionStorageUtility } from "@/_deprecating/common/utils/use-storage-utility"

export function useViewParams() {
  const [viewParams, setViewParams] = useSessionStorageUtility("view-params", DEFAULT_VIEW_PARAMS)
  const setViewParam = (param: keyof ViewParams, value: ViewParams[keyof ViewParams]) => {
    setViewParams((vp) => ({ ...vp, [param]: value }))
  }
  return { viewParams, setViewParam, setViewParams }
}

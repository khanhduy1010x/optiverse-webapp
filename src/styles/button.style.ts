import { getTypo } from '../constants/typography.constant';

const orgBackground = "flex p-3 rounded flex-row items-center justify-between gap-3 cursor-pointer active:translate-y-[5px]"

const orgTextBtn = `${getTypo(20, false)} text-center`

const orgView = "flex flex-row items-center justify-center"

export const BUTTON_CSS = {
  rootbg: orgBackground,
  rootText: orgTextBtn,
  rootView: orgView,
  circlebg: "aspect-square rounded-full justify-center"
}

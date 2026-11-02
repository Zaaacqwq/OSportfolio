export type MenuEntry =
  | {
      label: string;
      shortcut?: string;
      action?: () => void;
      disabled?: boolean;
      checked?: boolean;
      /** 子菜单 */
      submenu?: MenuEntry[];
    }
  | "separator";

export interface MenuDef {
  title: string;
  items: MenuEntry[];
}

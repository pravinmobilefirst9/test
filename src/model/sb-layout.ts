export interface SbLayout {
  width?: number;
  widthSm?: number;
  widthMd?: number;
  widthLg?: number;
  widthXl?: number;
  // fixedAt means component will stop growing after set breakpoint.
  fixAtSm?: boolean;
  fixedAtMd?: boolean;
  fixedAtLg?: boolean;
  fixedAtXl?: boolean;
  fixedAtLandscapePrint?: boolean;
  fixedAtPortraitPrint?: boolean;
}

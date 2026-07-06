/**
 * DeckleEdge — the torn, fibrous edge of a sheet of handmade watercolour
 * paper, used as a hard section divider. Place it at the very top of the
 * section *below* the break: the paper-coloured fill continues the sheet
 * above for a few pixels, then tears off along an irregular contour, so the
 * ground beneath reads as a genuinely new section rather than the same page.
 *
 * Two stacked contours fake the physical edge: a semi-opaque fringe first
 * (the thin translucent fibres where a deckle thins out), then the full
 * sheet on top. Both were generated once as a smoothed random walk and are
 * frozen here — a stable edge, not a re-rolled one per render.
 *
 * The drop-shadow keeps to the terracotta shadow palette (no greys — see
 * CLAUDE.md) and traces the torn contour itself, lifting the sheet off the
 * deeper ground below.
 */

const SHEET =
  'M0 10Q14.3 16 30.4 12.7Q46.5 9.4 59.6 9.9Q72.6 10.3 89.1 9.1Q105.6 7.8 122.5 8Q139.4 8.1 151.2 9.1Q163 10.2 173.9 9.3Q184.7 8.4 203.1 8.1Q221.5 7.8 230.6 9.1Q239.6 10.3 256.5 12.8Q273.4 15.2 287.6 13.2Q301.8 11.1 321.4 11.9Q340.9 12.7 358.7 9.3Q376.4 5.9 388 6.5Q399.7 7 407.9 8.1Q416 9.2 428.6 11Q441.1 12.8 457.2 10.9Q473.3 8.9 485 8.3Q496.6 7.7 515.5 7.9Q534.4 8 549.6 7.6Q564.8 7.1 580.7 8.7Q596.6 10.3 614.4 11.5Q632.1 12.6 640.6 11.8Q649.1 10.9 667.7 11.5Q686.3 12.1 701 12.5Q715.7 12.9 729.9 9.9Q744 6.9 757.7 9.2Q771.4 11.4 785.6 12.2Q799.7 13 814 11.3Q828.2 9.6 843.6 10Q858.9 10.3 870 8.6Q881 6.9 888.3 9.5Q895.6 12.1 910.8 11.8Q926 11.5 940.8 12.3Q955.5 13.1 966.1 12Q976.7 10.9 994.2 11.5Q1011.7 12.1 1020.5 11.1Q1029.3 10 1043.7 9.7Q1058 9.3 1067.8 10.8Q1077.5 12.3 1094.1 12.7Q1110.6 13.1 1125.6 13Q1140.5 12.9 1153.9 11.7Q1167.2 10.5 1184.6 9.3Q1201.9 8 1216.1 9.1Q1230.3 10.2 1239.7 9.9Q1249 9.6 1262.2 8.3Q1275.4 6.9 1284.7 6Q1293.9 5.1 1312.3 6.2Q1330.7 7.2 1340 8.6Q1349.2 10 1365.8 9.6Q1382.3 9.1 1411.2 10.5L1440 11.9L1440 0L0 0Z'

const FRINGE =
  'M0 15Q16.4 16.4 27.4 15Q38.4 13.5 52.1 15.2Q65.7 16.8 72.8 15.1Q79.9 13.4 88 15.1Q96.1 16.8 109.3 14.7Q122.4 12.6 135.3 15.1Q148.2 17.6 158 15.6Q167.7 13.5 177.2 13.3Q186.7 13.1 203 14.1Q219.3 15 238.6 16.1Q257.9 17.1 276.8 16.9Q295.6 16.7 311.8 15.4Q328 14 341.8 15.7Q355.5 17.4 373 15.7Q390.5 14 409.3 14.2Q428.1 14.4 445.6 15.2Q463 16 481.7 14.2Q500.3 12.3 514.9 14.4Q529.4 16.4 541.1 14.5Q552.8 12.6 560 14.2Q567.1 15.8 575.2 16.6Q583.3 17.4 599.3 15.3Q615.4 13.2 631.9 13.6Q648.4 14 656.3 15.2Q664.2 16.3 682.2 14.4Q700.1 12.4 709.3 14.1Q718.4 15.7 728.3 14.7Q738.1 13.6 748.2 15.7Q758.2 17.7 765.5 16.4Q772.8 15 781.3 15.2Q789.7 15.4 805.6 16Q821.4 16.6 839.4 14.6Q857.3 12.6 874.5 14.1Q891.7 15.5 907.9 15.5Q924 15.5 938.7 15.9Q953.4 16.3 963.1 16.3Q972.8 16.2 981 16.8Q989.1 17.3 998.2 15Q1007.2 12.6 1017.7 15.6Q1028.2 18.6 1042.4 17.1Q1056.5 15.5 1075.4 14.6Q1094.2 13.6 1108.2 14.3Q1122.1 14.9 1135.5 14.8Q1148.9 14.7 1156.2 15.6Q1163.4 16.4 1175.8 15.7Q1188.1 14.9 1196.6 16.1Q1205.1 17.2 1215.3 16.2Q1225.5 15.2 1237.3 15Q1249 14.8 1262 14.1Q1275 13.3 1283.6 15.1Q1292.2 16.8 1303.1 16.7Q1313.9 16.5 1330.9 16.1Q1347.8 15.7 1365.7 16.7Q1383.6 17.6 1392.1 15.4Q1400.6 13.2 1420.3 13.6L1440 14L1440 0L0 0Z'

export default function DeckleEdge({ className = '' }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1440 24"
      preserveAspectRatio="none"
      className={className}
      style={{ filter: 'drop-shadow(0 5px 10px rgba(61,101,158,0.22))' }}
    >
      <path d={FRINGE} fill="#F7F4EF" fillOpacity="0.55" />
      <path d={SHEET} fill="#F7F4EF" />
    </svg>
  )
}

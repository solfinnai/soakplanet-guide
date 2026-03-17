import React from 'react';
import { Document, Page, View, Text, Image, StyleSheet, Font, renderToFile } from '@react-pdf/renderer';
import { readFileSync } from 'fs';

// Load springs data
const springs = JSON.parse(readFileSync('./springs.json', 'utf8'));
const byState = {};
springs.forEach(s => { if (!byState[s.state]) byState[s.state] = []; byState[s.state].push(s); });
const stateNames = { AK:'Alaska',AR:'Arkansas',AZ:'Arizona',CA:'California',CO:'Colorado',GA:'Georgia',HI:'Hawaii',ID:'Idaho',MT:'Montana',NM:'New Mexico',NV:'Nevada',NY:'New York',NC:'North Carolina',OH:'Ohio',OR:'Oregon',SD:'South Dakota',TX:'Texas',UT:'Utah',VA:'Virginia',WA:'Washington',WV:'West Virginia',WY:'Wyoming',IN:'Indiana',NE:'Nebraska',OK:'Oklahoma',LA:'Louisiana',TN:'Tennessee' };

// Use built-in fonts (Helvetica + Times-Roman) to avoid download issues
// Playfair → Times-Roman (serif), Inter → Helvetica (sans)
const _Playfair = 'Times-Roman';
const _PlayfairBold = 'Times-Bold';
const _Inter = 'Helvetica';
const _InterBold = 'Helvetica-Bold';

Font.registerHyphenationCallback(word => [word]);

const TEAL = '#1a6b5a';
const CREAM = '#faf7f2';
const TERRA = '#c4633e';
const DARK = '#1a1a1a';
const GRAY = '#666666';
const LGRAY = '#f5f5f5';

const photos = [
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80',
  'https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?w=600&q=80',
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&q=80',
  'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&q=80',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&q=80',
  'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=600&q=80',
  'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=600&q=80',
  'https://images.unsplash.com/photo-1482192505345-5655af888cc4?w=600&q=80',
  'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&q=80',
  'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=600&q=80',
];

const s = StyleSheet.create({
  page: { width: 612, height: 792, fontFamily: 'Helvetica', fontSize: 10, color: DARK },
  pad: { padding: 50 },
  pageNum: { position: 'absolute', bottom: 24, left: 0, right: 0, textAlign: 'center', fontSize: 8, color: GRAY },
  // Cover
  coverPage: { backgroundColor: CREAM, justifyContent: 'center', alignItems: 'center', padding: 60 },
  coverImg: { width: 350, height: 220, objectFit: 'cover', marginBottom: 40 },
  coverTitle: { fontFamily: 'Times-Bold', fontSize: 120, color: TEAL, letterSpacing: 8 },
  coverSub1: { fontFamily: 'Helvetica', fontSize: 14, color: GRAY, marginTop: 8 },
  coverSub2: { fontFamily: 'Times-Bold', fontSize: 28, color: DARK, marginTop: 4 },
  coverBottom: { fontFamily: 'Helvetica', fontSize: 11, color: GRAY, marginTop: 40 },
  coverBrand: { fontFamily: 'Helvetica-Bold', fontSize: 10, color: TEAL, marginTop: 8 },
  // Section dividers
  divider: { justifyContent: 'center', alignItems: 'center', padding: 80 },
  dividerTitle: { fontFamily: 'Times-Bold', fontSize: 42, color: '#ffffff', textAlign: 'center' },
  dividerSub: { fontFamily: 'Helvetica', fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: 12, textAlign: 'center' },
  // TOC
  tocTitle: { fontFamily: 'Times-Bold', fontSize: 36, color: DARK, marginBottom: 30 },
  tocRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 0.5, borderBottomColor: '#e0e0e0' },
  tocLabel: { fontFamily: 'Helvetica', fontSize: 12, color: DARK },
  tocPage: { fontFamily: 'Helvetica', fontSize: 12, color: GRAY },
  // Essay
  essayTitle: { fontFamily: 'Times-Bold', fontSize: 32, color: DARK, marginBottom: 20 },
  essayBody: { fontSize: 11, lineHeight: 1.7, color: '#333', marginBottom: 12 },
  pullQuote: { fontFamily: 'Times-Roman', fontSize: 20, color: TEAL, textAlign: 'center', marginVertical: 24, paddingHorizontal: 30, lineHeight: 1.5 },
  // Spring page
  springImg: { width: '100%', height: 220, objectFit: 'cover', marginBottom: 16 },
  springName: { fontFamily: 'Times-Bold', fontSize: 28, color: DARK, marginBottom: 4 },
  springLoc: { fontSize: 11, color: GRAY, marginBottom: 12 },
  springDesc: { fontSize: 11, lineHeight: 1.6, color: '#333', marginBottom: 16 },
  infoBox: { flexDirection: 'row', flexWrap: 'wrap', backgroundColor: LGRAY, padding: 16, gap: 4 },
  infoItem: { width: '30%', marginBottom: 8 },
  infoLabel: { fontSize: 8, color: GRAY, textTransform: 'uppercase', letterSpacing: 1 },
  infoVal: { fontFamily: 'Helvetica-Bold', fontSize: 11, color: DARK, marginTop: 2 },
  // Collections
  collTitle: { fontFamily: 'Times-Bold', fontSize: 24, color: DARK, marginBottom: 20 },
  collEntry: { marginBottom: 14, paddingBottom: 10, borderBottomWidth: 0.5, borderBottomColor: '#e0e0e0' },
  collName: { fontFamily: 'Helvetica-Bold', fontSize: 12, color: DARK },
  collMeta: { fontSize: 9, color: GRAY, marginTop: 2 },
  collDesc: { fontSize: 10, color: '#444', marginTop: 4, lineHeight: 1.5 },
  // Road trips
  dayEntry: { marginBottom: 12 },
  dayLabel: { fontFamily: 'Helvetica-Bold', fontSize: 11, color: TERRA },
  dayText: { fontSize: 10, color: '#444', marginTop: 2, lineHeight: 1.5 },
  // Handbook
  hbTitle: { fontFamily: 'Times-Bold', fontSize: 20, color: DARK, marginBottom: 12, marginTop: 16 },
  hbItem: { fontSize: 10, color: '#333', lineHeight: 1.6, marginBottom: 4 },
  // Directory
  stateHeader: { fontFamily: 'Times-Bold', fontSize: 16, color: TEAL, marginTop: 16, marginBottom: 8, paddingBottom: 4, borderBottomWidth: 1, borderBottomColor: TEAL },
  dirRow: { flexDirection: 'row', paddingVertical: 4, paddingHorizontal: 4, fontSize: 8 },
  dirRowAlt: { backgroundColor: LGRAY },
  dirCell: { fontSize: 8, color: DARK },
  dirCellName: { width: '28%', fontSize: 8, fontFamily: 'Helvetica-Bold' },
  dirCellCity: { width: '18%', fontSize: 8, color: GRAY },
  dirCellTemp: { width: '10%', fontSize: 8, textAlign: 'center' },
  dirCellType: { width: '14%', fontSize: 8 },
  dirCellPrice: { width: '10%', fontSize: 8, textAlign: 'center' },
  dirCellRate: { width: '10%', fontSize: 8, textAlign: 'center', color: TERRA },
  dirCellDiff: { width: '10%', fontSize: 8, textAlign: 'center' },
});

const PageNum = ({ num }) => React.createElement(Text, { style: s.pageNum }, String(num));

// Top 10
const top10 = [...springs].sort((a,b) => b.rating - a.rating).slice(0, 10);

const descriptions = [
  "The steam rises in lazy spirals against a canvas of Colorado wilderness. Dunton Hot Springs sits in a restored ghost town at 9,000 feet, where hand-hewn log cabins line a single dirt road and the hot spring emerges into a bathhouse that time forgot. This is where the modern world dissolves — no cell service, no screens, just the sound of the West Fork of the Dolores River and the warmth of 106-degree mineral water against your skin.",
  "Perched on the cliffs of Big Sur, Tassajara feels less like a destination and more like a secret whispered between friends. As the oldest Zen monastery in America, it opens to the public only in summer, when the creek runs cold and the sulfur pools run hot. The silence here isn't empty — it hums with intention.",
  "Esalen is myth made real. The clothing-optional pools hang over the Pacific Ocean, perched on cliffs where sea otters play in the kelp below. At night, the Milky Way stretches overhead while 120-degree water cascades through stone tubs. It's simultaneously ancient and radical — a place that has shaped American consciousness since the 1960s.",
  "Solage brings Napa Valley elegance to the art of soaking. The geothermal pools are impeccably designed — clean lines, mature palms, and that particular quality of California light that makes everything look like a film still. After your soak, there's world-class wine waiting.",
  "The institute that launched a thousand ideas. Esalen's workshops have hosted everyone from Aldous Huxley to Joan Baez, and the hot springs remain the spiritual center. Clothing optional, perched above the crashing Pacific, the pools are terraced into the cliff face like ancient Roman baths reimagined by California dreamers.",
  "Ten Thousand Waves is Japan transplanted to the high desert of New Mexico. Cedar soaking tubs dot a piñon-covered hillside above Santa Fe, each one a private universe. The architecture is flawless — Japanese post-and-beam meets adobe, and the effect is pure serenity.",
  "Castle Hot Springs is where the Sonoran Desert reveals its secret: beneath the saguaros and the scorching sun, the earth is warm and generous. This restored 1896 resort channels that generosity into three spring-fed pools, each a different temperature, each with a view of the Bradshaw Mountains.",
  "Burgdorf is Idaho at its most honest. A collection of hand-built cabins around a 112-degree pool, accessible only by a dirt road that gets questionable in winter. No electricity, no Wi-Fi, no pretense. Just stars, steam, and the kind of quiet that city people have forgotten exists.",
  "Antero sits at 9,000 feet in the Arkansas River Valley, where the Collegiate Peaks form a wall of granite along the western horizon. Each cabin has its own private hot spring tub, fed by the same geothermal source that has drawn visitors for centuries. On clear nights, the stars feel close enough to touch.",
  "Riverbend lives up to its name — hot spring pools terraced along the banks of the Rio Grande in Truth or Consequences, a town that renamed itself after a game show and never looked back. The water is 107 degrees, the vibe is wonderfully weird, and the sunsets over the desert mesas are worth the drive alone.",
];

// Collections data
const solitude = springs.filter(s => s.type === 'primitive' || s.difficulty === 'Challenging').sort((a,b) => b.rating - a.rating).slice(0,5);
const family = springs.filter(s => s.difficulty === 'Easy' && s.type === 'developed').sort((a,b) => b.rating - a.rating).slice(0,5);
const freeOnes = springs.filter(s => s.free).sort((a,b) => b.rating - a.rating).slice(0,5);
const luxury = springs.filter(s => s.type === 'resort').sort((a,b) => b.rating - a.rating).slice(0,5);
const winter = [...springs].sort((a,b) => b.temp - a.temp).slice(0,5);
const clothingOpt = springs.filter(s => s.id.includes('clothing') || s.id.includes('esalen') || s.id.includes('harbin') || s.id.includes('deep-creek') || s.id.includes('strawberry') || s.id.includes('orvis') || s.id.includes('valley-view')).slice(0,5);
const clothingFallback = clothingOpt.length < 5 ? [...clothingOpt, ...springs.filter(s => s.type === 'natural').slice(0, 5 - clothingOpt.length)] : clothingOpt;

// Road trip springs
const pacificSprings = springs.filter(s => ['CA','OR','WA'].includes(s.state)).sort((a,b) => b.rating - a.rating).slice(0,7);
const rockySprings = springs.filter(s => ['CO','MT','ID','WY'].includes(s.state)).sort((a,b) => b.rating - a.rating).slice(0,7);
const swSprings = springs.filter(s => ['AZ','NM','NV','UT'].includes(s.state)).sort((a,b) => b.rating - a.rating).slice(0,7);

const CollectionPage = ({ title, items, pageNum }) => React.createElement(
  Page, { size: [612, 792], style: [s.page, s.pad] },
  React.createElement(Text, { style: s.collTitle }, title),
  ...items.map((sp, i) => React.createElement(
    View, { key: i, style: s.collEntry },
    React.createElement(Text, { style: s.collName }, `${sp.name}`),
    React.createElement(Text, { style: s.collMeta }, `${sp.city}, ${stateNames[sp.state] || sp.state} · ${sp.temp}°F · ${sp.free ? 'Free' : sp.price || 'Paid'} · ${sp.rating}★`),
    React.createElement(Text, { style: s.collDesc }, `A ${sp.difficulty.toLowerCase()}-access ${sp.type} spring at ${sp.temp}°F. ${sp.free ? 'Completely free to visit.' : `Admission ${sp.price || 'varies'}.`} ${sp.access} access.`),
  )),
  React.createElement(PageNum, { num: pageNum }),
);

const RoadTripPages = ({ title, subtitle, tripSprings, startPage, img }) => {
  const pages = [];
  // Page 1 with image
  pages.push(React.createElement(
    Page, { key: 'rt1', size: [612, 792], style: [s.page, s.pad] },
    React.createElement(Image, { src: img, style: { width: '100%', height: 160, objectFit: 'cover', marginBottom: 16 } }),
    React.createElement(Text, { style: { fontFamily: 'Times-Bold', fontSize: 24, color: DARK, marginBottom: 4 } }, title),
    React.createElement(Text, { style: { fontSize: 11, color: GRAY, marginBottom: 20 } }, subtitle),
    ...tripSprings.slice(0, 4).map((sp, i) => React.createElement(
      View, { key: i, style: s.dayEntry },
      React.createElement(Text, { style: s.dayLabel }, `Day ${i + 1}: ${sp.name}, ${sp.city}`),
      React.createElement(Text, { style: s.dayText }, `${sp.temp}°F ${sp.type} spring. ${sp.free ? 'Free entry.' : `Admission ${sp.price || 'varies'}.`} ${sp.difficulty} access. Drive to your next stop and settle in for the evening.`),
    )),
    React.createElement(PageNum, { num: startPage }),
  ));
  // Page 2
  pages.push(React.createElement(
    Page, { key: 'rt2', size: [612, 792], style: [s.page, s.pad] },
    ...tripSprings.slice(4).map((sp, i) => React.createElement(
      View, { key: i, style: s.dayEntry },
      React.createElement(Text, { style: s.dayLabel }, `Day ${i + 5}: ${sp.name}, ${sp.city}`),
      React.createElement(Text, { style: s.dayText }, `${sp.temp}°F ${sp.type} spring. ${sp.free ? 'Free entry.' : `Admission ${sp.price || 'varies'}.`} ${sp.difficulty} access. Take your time — the journey is the destination.`),
    )),
    React.createElement(View, { style: { marginTop: 20, padding: 16, backgroundColor: CREAM } },
      React.createElement(Text, { style: { fontFamily: 'Helvetica-Bold', fontSize: 10, color: TEAL, marginBottom: 4 } }, 'PRO TIP'),
      React.createElement(Text, { style: { fontSize: 9, color: '#444', lineHeight: 1.5 } }, 'Book accommodations in advance during peak season (June-August). Many hot springs towns have limited lodging. Consider camping for the full experience — several springs have nearby campgrounds.'),
    ),
    React.createElement(PageNum, { num: startPage + 1 }),
  ));
  return pages;
};

// Build state directory pages
const stateKeys = Object.keys(byState).sort();
const dirPages = [];
let currentStates = [];
let rowCount = 0;

stateKeys.forEach(st => {
  const stSprings = byState[st];
  const needed = stSprings.length + 2; // header + rows
  if (rowCount + needed > 45) {
    dirPages.push([...currentStates]);
    currentStates = [];
    rowCount = 0;
  }
  currentStates.push({ state: st, springs: stSprings });
  rowCount += needed;
});
if (currentStates.length > 0) dirPages.push(currentStates);

// Free springs list
const freeSprings = springs.filter(s => s.free).sort((a,b) => (stateNames[a.state]||a.state).localeCompare(stateNames[b.state]||b.state));
// By temp
const byTemp = [...springs].sort((a,b) => b.temp - a.temp);

const doc = React.createElement(Document, {},
  // === COVER ===
  React.createElement(Page, { size: [612, 792], style: [s.page, s.coverPage] },
    React.createElement(Image, { src: photos[0], style: s.coverImg }),
    React.createElement(Text, { style: s.coverTitle }, 'SOAK'),
    React.createElement(Text, { style: s.coverSub1 }, 'The Definitive Guide to'),
    React.createElement(Text, { style: s.coverSub2 }, "America's Hot Springs"),
    React.createElement(Text, { style: s.coverBottom }, '289 Springs · 26 States'),
    React.createElement(Text, { style: s.coverBrand }, 'SoakPlanet'),
  ),

  // === TOC ===
  React.createElement(Page, { size: [612, 792], style: [s.page, s.pad] },
    React.createElement(Text, { style: s.tocTitle }, 'Contents'),
    ...['Why We Soak,3', 'The Map,4', 'The 10 Best Hot Springs,5', 'Curated Collections,16', 'Road Trip Itineraries,22', "The Soaker's Handbook,28", 'State-by-State Directory,31', 'Quick Reference,45', ''].filter(Boolean).map((item, i) => {
      const [label, pg] = item.split(',');
      return React.createElement(View, { key: i, style: s.tocRow },
        React.createElement(Text, { style: s.tocLabel }, label),
        React.createElement(Text, { style: s.tocPage }, pg),
      );
    }),
    React.createElement(PageNum, { num: 2 }),
  ),

  // === WHY WE SOAK ===
  React.createElement(Page, { size: [612, 792], style: [s.page, { backgroundColor: TEAL, justifyContent: 'center', alignItems: 'center', padding: 80 }] },
    React.createElement(Text, { style: { fontFamily: 'Times-Bold', fontSize: 48, color: '#ffffff', textAlign: 'center' } }, 'Why We Soak'),
    React.createElement(Text, { style: { fontFamily: 'Helvetica', fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: 12 } }, 'An essay on the art of doing nothing'),
  ),
  React.createElement(Page, { size: [612, 792], style: [s.page, s.pad] },
    React.createElement(Image, { src: photos[8], style: { width: '100%', height: 180, objectFit: 'cover', marginBottom: 20 } }),
    React.createElement(Text, { style: s.essayBody }, "Long before wellness became an industry, before spa culture was commodified into cucumber water and ambient playlists, there was simply this: a body of warm water, rising from the earth, and a human being wise enough to get in."),
    React.createElement(Text, { style: s.pullQuote }, '"There is something ancient and irreducible about lowering yourself into naturally heated water. It asks nothing of you except presence."'),
    React.createElement(Text, { style: s.essayBody }, "Hot springs have drawn people for millennia. The Romans built empires around them. The Japanese elevated bathing to spiritual practice with their onsen tradition. Indigenous peoples across the Americas considered thermal waters sacred healing grounds — neutral territory where even warring tribes laid down weapons."),
    React.createElement(Text, { style: s.essayBody }, "Today, we soak for different reasons and the same ones. The minerals — sulfur, lithium, magnesium, silica — are real medicine, clinically shown to reduce inflammation, ease chronic pain, and improve skin conditions. But the deeper medicine is simpler: hot water forces you to stop. You cannot scroll in a hot spring. You cannot hustle. You can only be."),
    React.createElement(Text, { style: s.essayBody }, "America holds an extraordinary wealth of thermal water. From the volcanic coast of Alaska to the desert basins of New Mexico, from primitive pools you hike hours to reach to century-old resort towns built on geothermal abundance — this country has nearly 1,700 known thermal springs. We've mapped 289 of the best."),
    React.createElement(Text, { style: s.essayBody }, "This guide is an invitation to slow down. To drive the long road. To find the unmarked trailhead. To lower yourself into water that has been warm since before humans had a name for warmth, and to remember what it feels like to simply exist."),
    React.createElement(PageNum, { num: 4 }),
  ),

  // === TOP 10 DIVIDER ===
  React.createElement(Page, { size: [612, 792], style: [s.page, { backgroundColor: TERRA, justifyContent: 'center', alignItems: 'center', padding: 80 }] },
    React.createElement(Text, { style: s.dividerTitle }, 'The 10 Best'),
    React.createElement(Text, { style: { fontFamily: 'Times-Bold', fontSize: 42, color: '#ffffff', textAlign: 'center' } }, 'Hot Springs in America'),
    React.createElement(Text, { style: s.dividerSub }, 'Our editors\' picks for the ultimate soak'),
  ),

  // === TOP 10 PAGES ===
  ...top10.map((sp, i) => React.createElement(
    Page, { key: `top${i}`, size: [612, 792], style: [s.page, s.pad] },
    React.createElement(Image, { src: photos[i], style: s.springImg }),
    React.createElement(Text, { style: s.springName }, sp.name),
    React.createElement(Text, { style: s.springLoc }, `${sp.city}, ${stateNames[sp.state] || sp.state}`),
    React.createElement(Text, { style: s.springDesc }, descriptions[i]),
    React.createElement(View, { style: s.infoBox },
      React.createElement(View, { style: s.infoItem },
        React.createElement(Text, { style: s.infoLabel }, 'Temperature'),
        React.createElement(Text, { style: s.infoVal }, `${sp.temp}°F`),
      ),
      React.createElement(View, { style: s.infoItem },
        React.createElement(Text, { style: s.infoLabel }, 'Type'),
        React.createElement(Text, { style: s.infoVal }, sp.type),
      ),
      React.createElement(View, { style: s.infoItem },
        React.createElement(Text, { style: s.infoLabel }, 'Price'),
        React.createElement(Text, { style: s.infoVal }, sp.free ? 'Free' : sp.price || 'Paid'),
      ),
      React.createElement(View, { style: s.infoItem },
        React.createElement(Text, { style: s.infoLabel }, 'Difficulty'),
        React.createElement(Text, { style: s.infoVal }, sp.difficulty),
      ),
      React.createElement(View, { style: s.infoItem },
        React.createElement(Text, { style: s.infoLabel }, 'Rating'),
        React.createElement(Text, { style: s.infoVal }, `${sp.rating}★`),
      ),
      React.createElement(View, { style: s.infoItem },
        React.createElement(Text, { style: s.infoLabel }, 'Access'),
        React.createElement(Text, { style: s.infoVal }, sp.access),
      ),
    ),
    React.createElement(PageNum, { num: 6 + i }),
  )),

  // === COLLECTIONS DIVIDER ===
  React.createElement(Page, { size: [612, 792], style: [s.page, { backgroundColor: CREAM, justifyContent: 'center', alignItems: 'center', padding: 80 }] },
    React.createElement(Text, { style: { fontFamily: 'Times-Bold', fontSize: 42, color: DARK, textAlign: 'center' } }, 'Curated Collections'),
    React.createElement(Text, { style: { fontSize: 14, color: GRAY, marginTop: 12, textAlign: 'center' } }, 'Springs for every mood and occasion'),
  ),

  // === COLLECTION PAGES ===
  React.createElement(CollectionPage, { title: '5 Springs for Solitude Seekers', items: solitude, pageNum: 17 }),
  React.createElement(CollectionPage, { title: 'Best Clothing-Optional Springs', items: clothingFallback, pageNum: 18 }),
  React.createElement(CollectionPage, { title: 'Family-Friendly Soaks', items: family, pageNum: 19 }),
  React.createElement(CollectionPage, { title: 'Free Hot Springs Worth the Hike', items: freeOnes, pageNum: 20 }),
  React.createElement(CollectionPage, { title: 'Luxury Resort Experiences', items: luxury, pageNum: 21 }),
  React.createElement(CollectionPage, { title: 'Best Winter Hot Springs', items: winter, pageNum: 22 }),

  // === ROAD TRIPS DIVIDER ===
  React.createElement(Page, { size: [612, 792], style: [s.page, { backgroundColor: TEAL, justifyContent: 'center', alignItems: 'center', padding: 80 }] },
    React.createElement(Text, { style: s.dividerTitle }, 'Road Trip'),
    React.createElement(Text, { style: { fontFamily: 'Times-Bold', fontSize: 42, color: '#ffffff', textAlign: 'center' } }, 'Itineraries'),
    React.createElement(Text, { style: s.dividerSub }, 'Three epic routes through hot springs country'),
  ),

  // === ROAD TRIP PAGES ===
  ...RoadTripPages({ title: 'Pacific Coast Hot Springs Trail', subtitle: '7 days · California, Oregon & Washington', tripSprings: pacificSprings, startPage: 24, img: 'https://images.unsplash.com/photo-1506953823976-52e1fdc0149a?w=600&q=80' }),
  ...RoadTripPages({ title: 'Rocky Mountain Soak Circuit', subtitle: '7 days · Colorado, Montana, Idaho & Wyoming', tripSprings: rockySprings, startPage: 26, img: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80' }),
  ...RoadTripPages({ title: 'Southwest Desert Springs', subtitle: '7 days · Arizona, New Mexico, Nevada & Utah', tripSprings: swSprings, startPage: 28, img: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&q=80' }),

  // === HANDBOOK DIVIDER ===
  React.createElement(Page, { size: [612, 792], style: [s.page, { backgroundColor: TERRA, justifyContent: 'center', alignItems: 'center', padding: 80 }] },
    React.createElement(Text, { style: s.dividerTitle }, "The Soaker's"),
    React.createElement(Text, { style: { fontFamily: 'Times-Bold', fontSize: 42, color: '#ffffff', textAlign: 'center' } }, 'Handbook'),
    React.createElement(Text, { style: s.dividerSub }, 'Everything you need to know before you go'),
  ),

  // === HANDBOOK PAGES ===
  React.createElement(Page, { size: [612, 792], style: [s.page, s.pad] },
    React.createElement(Text, { style: s.hbTitle }, 'Hot Springs Etiquette'),
    ...['Shower before entering any pool. This is non-negotiable.', 'Keep your voice low. People come here for peace.', 'If it\'s clothing optional, respect both clothed and unclothed visitors.', 'Never bring glass containers near hot springs.', 'Pack out everything you pack in. Leave no trace.', 'Don\'t use soap, shampoo, or any chemicals in natural springs.', 'Respect posted time limits during busy periods.', 'Keep pets away from hot springs unless explicitly allowed.', 'Don\'t move rocks or alter natural pools.', 'If someone is meditating or resting quietly, give them space.'].map((rule, i) => 
      React.createElement(Text, { key: i, style: s.hbItem }, `${i + 1}. ${rule}`)
    ),
    React.createElement(Text, { style: s.hbTitle }, 'Temperature Guide'),
    ...['95-100°F: Warm and gentle. Perfect for long soaks and families.', '100-104°F: The sweet spot. Most developed springs target this range.', '104-108°F: Hot. Limit to 15-20 minutes. Stay hydrated.', '108-112°F: Very hot. Brief soaks only. Cool off between sessions.', '112°F+: Dangerously hot. Most springs at this temp are for looking, not soaking.'].map((t, i) =>
      React.createElement(Text, { key: i, style: s.hbItem }, `• ${t}`)
    ),
    React.createElement(PageNum, { num: 31 }),
  ),

  React.createElement(Page, { size: [612, 792], style: [s.page, s.pad] },
    React.createElement(Text, { style: s.hbTitle }, 'Packing Checklist'),
    ...['□ Swimsuit (even for clothing-optional spots — always have one)', '□ Quick-dry towel', '□ Water bottle (hydration is critical in hot water)', '□ Sandals or water shoes', '□ Headlamp or flashlight (many springs are best at night)', '□ Dry bag for electronics', '□ Sunscreen (SPF 30+ for daytime soaks)', '□ Snacks (salty ones — you lose electrolytes)', '□ First aid kit', '□ Cash (many remote springs are cash-only)', '□ Trash bag (pack it out)', '□ Warm layers for the walk back (you cool fast)'].map((item, i) =>
      React.createElement(Text, { key: i, style: s.hbItem }, item)
    ),
    React.createElement(Text, { style: s.hbTitle }, 'Mineral Guide'),
    ...['Sulfur: Antimicrobial, treats skin conditions like eczema and psoriasis.', 'Lithium: Natural mood stabilizer. Common in desert springs.', 'Magnesium: Muscle relaxation, stress reduction, better sleep.', 'Silica: Skin softening, collagen support, anti-aging properties.', 'Calcium: Bone health, joint support, circulation.', 'Sodium bicarbonate: Softens skin, neutralizes acid, deeply cleansing.'].map((m, i) =>
      React.createElement(Text, { key: i, style: s.hbItem }, `• ${m}`)
    ),
    React.createElement(PageNum, { num: 32 }),
  ),

  React.createElement(Page, { size: [612, 792], style: [s.page, s.pad] },
    React.createElement(Text, { style: s.hbTitle }, 'Safety Tips'),
    ...['Never soak alone in remote or primitive springs.', 'Check water temperature before entering — use your hand, not your foot.', 'Stay hydrated. Drink water before, during, and after soaking.', 'Limit soaks to 15-20 minutes in water above 104°F.', 'Avoid hot springs if you\'re pregnant, have heart conditions, or are intoxicated.', 'Be aware of amoeba risk in warm, stagnant water — never submerge your head.', 'Check current conditions before visiting wilderness springs — roads and trails change.', 'Tell someone where you\'re going if visiting a remote spring.', 'Watch for slippery surfaces — mineral deposits make rocks treacherous.', 'Respect closures. If a spring is closed, there\'s usually a good reason.'].map((tip, i) =>
      React.createElement(Text, { key: i, style: s.hbItem }, `${i + 1}. ${tip}`)
    ),
    React.createElement(Text, { style: { ...s.pullQuote, marginTop: 30, fontSize: 16 } }, '"The best hot spring is the one you\'re in right now."'),
    React.createElement(PageNum, { num: 33 }),
  ),

  // === DIRECTORY DIVIDER ===
  React.createElement(Page, { size: [612, 792], style: [s.page, { backgroundColor: DARK, justifyContent: 'center', alignItems: 'center', padding: 80 }] },
    React.createElement(Text, { style: s.dividerTitle }, 'State-by-State'),
    React.createElement(Text, { style: { fontFamily: 'Times-Bold', fontSize: 42, color: '#ffffff', textAlign: 'center' } }, 'Directory'),
    React.createElement(Text, { style: s.dividerSub }, `All ${springs.length} springs · ${Object.keys(byState).length} states`),
  ),

  // === DIRECTORY PAGES ===
  ...dirPages.map((pageStates, pi) => React.createElement(
    Page, { key: `dir${pi}`, size: [612, 792], style: [s.page, { padding: 30 }] },
    ...pageStates.flatMap(({ state: st, springs: stSprings }) => [
      React.createElement(Text, { key: `h${st}`, style: s.stateHeader }, `${stateNames[st] || st} (${stSprings.length})`),
      // Header row
      React.createElement(View, { key: `hdr${st}`, style: [s.dirRow, { borderBottomWidth: 0.5, borderBottomColor: '#ccc' }] },
        React.createElement(Text, { style: [s.dirCellName, { fontSize: 7, color: GRAY }] }, 'NAME'),
        React.createElement(Text, { style: [s.dirCellCity, { fontSize: 7, color: GRAY }] }, 'CITY'),
        React.createElement(Text, { style: [s.dirCellTemp, { fontSize: 7, color: GRAY }] }, 'TEMP'),
        React.createElement(Text, { style: [s.dirCellType, { fontSize: 7, color: GRAY }] }, 'TYPE'),
        React.createElement(Text, { style: [s.dirCellPrice, { fontSize: 7, color: GRAY }] }, 'PRICE'),
        React.createElement(Text, { style: [s.dirCellRate, { fontSize: 7, color: GRAY }] }, 'RATING'),
        React.createElement(Text, { style: [s.dirCellDiff, { fontSize: 7, color: GRAY }] }, 'DIFF'),
      ),
      ...stSprings.map((sp, si) => React.createElement(
        View, { key: `${st}${si}`, style: [s.dirRow, si % 2 === 1 ? s.dirRowAlt : {}] },
        React.createElement(Text, { style: s.dirCellName }, sp.name.length > 28 ? sp.name.substring(0, 26) + '…' : sp.name),
        React.createElement(Text, { style: s.dirCellCity }, sp.city.length > 16 ? sp.city.substring(0, 14) + '…' : sp.city),
        React.createElement(Text, { style: s.dirCellTemp }, `${sp.temp}°`),
        React.createElement(Text, { style: s.dirCellType }, sp.type),
        React.createElement(Text, { style: s.dirCellPrice }, sp.free ? 'Free' : sp.price || '$$'),
        React.createElement(Text, { style: s.dirCellRate }, `${sp.rating}★`),
        React.createElement(Text, { style: s.dirCellDiff }, sp.difficulty),
      )),
    ]),
    React.createElement(PageNum, { num: 35 + pi }),
  )),

  // === QUICK REF: FREE SPRINGS ===
  React.createElement(Page, { size: [612, 792], style: [s.page, s.pad] },
    React.createElement(Text, { style: { fontFamily: 'Times-Bold', fontSize: 24, color: DARK, marginBottom: 16 } }, 'All Free Hot Springs'),
    React.createElement(Text, { style: { fontSize: 9, color: GRAY, marginBottom: 12 } }, `${freeSprings.length} springs across America where the soak costs nothing`),
    ...freeSprings.map((sp, i) => React.createElement(
      Text, { key: i, style: { fontSize: 8, color: DARK, lineHeight: 1.6 } },
      `${sp.name} · ${sp.city}, ${stateNames[sp.state] || sp.state} · ${sp.temp}°F · ${sp.difficulty}`
    )),
    React.createElement(PageNum, { num: 45 }),
  ),

  // === QUICK REF: BY TEMP ===
  React.createElement(Page, { size: [612, 792], style: [s.page, s.pad] },
    React.createElement(Text, { style: { fontFamily: 'Times-Bold', fontSize: 24, color: DARK, marginBottom: 16 } }, 'Springs by Temperature'),
    React.createElement(Text, { style: { fontSize: 9, color: GRAY, marginBottom: 12 } }, 'Hottest to coolest'),
    ...byTemp.slice(0, 70).map((sp, i) => React.createElement(
      Text, { key: i, style: { fontSize: 8, color: DARK, lineHeight: 1.6 } },
      `${sp.temp}°F · ${sp.name} · ${stateNames[sp.state] || sp.state}`
    )),
    React.createElement(PageNum, { num: 46 }),
  ),
  React.createElement(Page, { size: [612, 792], style: [s.page, s.pad] },
    React.createElement(Text, { style: { fontSize: 9, color: GRAY, marginBottom: 8 } }, 'Springs by Temperature (continued)'),
    ...byTemp.slice(70, 160).map((sp, i) => React.createElement(
      Text, { key: i, style: { fontSize: 8, color: DARK, lineHeight: 1.6 } },
      `${sp.temp}°F · ${sp.name} · ${stateNames[sp.state] || sp.state}`
    )),
    React.createElement(PageNum, { num: 47 }),
  ),
  React.createElement(Page, { size: [612, 792], style: [s.page, s.pad] },
    React.createElement(Text, { style: { fontSize: 9, color: GRAY, marginBottom: 8 } }, 'Springs by Temperature (continued)'),
    ...byTemp.slice(160).map((sp, i) => React.createElement(
      Text, { key: i, style: { fontSize: 8, color: DARK, lineHeight: 1.6 } },
      `${sp.temp}°F · ${sp.name} · ${stateNames[sp.state] || sp.state}`
    )),
    React.createElement(PageNum, { num: 48 }),
  ),

  // === BACK COVER ===
  React.createElement(Page, { size: [612, 792], style: [s.page, { backgroundColor: TEAL, justifyContent: 'center', alignItems: 'center', padding: 80 }] },
    React.createElement(Text, { style: { fontFamily: 'Times-Bold', fontSize: 72, color: '#ffffff' } }, 'SOAK'),
    React.createElement(Text, { style: { fontFamily: 'Helvetica', fontSize: 16, color: 'rgba(255,255,255,0.8)', marginTop: 16 } }, 'soakplanet.com'),
    React.createElement(Text, { style: { fontFamily: 'Helvetica', fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 8 } }, 'Every Hot Spring in America'),
    React.createElement(Text, { style: { fontFamily: 'Helvetica', fontSize: 9, color: 'rgba(255,255,255,0.3)', marginTop: 40 } }, '© 2026 SoakPlanet. All rights reserved.'),
  ),
);

console.log('Generating PDF...');
await renderToFile(doc, './SOAK-Guide.pdf');
console.log('✅ SOAK-Guide.pdf generated!');

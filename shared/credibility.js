// Spectrum — Credibility scoring module (CRED-1 inspired)
// Scores 0-100 based on factCheckRecord, editorialStandards, transparencyScore, correctionPolicy

const CREDIBILITY_DB = {
  // Far Left
  "jacobin.com":          { score: 52, factCheck: 45, editorial: 60, transparency: 55, correction: 50 },
  "theintercept.com":     { score: 65, factCheck: 68, editorial: 72, transparency: 60, correction: 62 },
  "democracynow.org":     { score: 58, factCheck: 55, editorial: 62, transparency: 60, correction: 55 },
  "currentaffairs.org":   { score: 50, factCheck: 45, editorial: 55, transparency: 50, correction: 50 },
  "truthout.org":         { score: 48, factCheck: 42, editorial: 52, transparency: 50, correction: 48 },
  "commondreams.org":     { score: 45, factCheck: 40, editorial: 50, transparency: 48, correction: 44 },
  "therealnews.com":      { score: 50, factCheck: 45, editorial: 55, transparency: 52, correction: 48 },
  "inthesetimes.com":     { score: 52, factCheck: 48, editorial: 58, transparency: 52, correction: 50 },

  // Left
  "msnbc.com":            { score: 58, factCheck: 56, editorial: 64, transparency: 60, correction: 54, pmiValidated: true },
  "huffpost.com":         { score: 58, factCheck: 55, editorial: 62, transparency: 60, correction: 56 },
  "vox.com":              { score: 72, factCheck: 74, editorial: 76, transparency: 70, correction: 70 },
  "theguardian.com":      { score: 82, factCheck: 85, editorial: 88, transparency: 80, correction: 78 },
  "slate.com":            { score: 65, factCheck: 62, editorial: 70, transparency: 66, correction: 63 },
  "motherjones.com":      { score: 68, factCheck: 70, editorial: 72, transparency: 66, correction: 65 },
  "thenation.com":        { score: 60, factCheck: 58, editorial: 65, transparency: 62, correction: 58 },
  "salon.com":            { score: 52, factCheck: 48, editorial: 56, transparency: 55, correction: 50 },
  "thedailybeast.com":    { score: 58, factCheck: 55, editorial: 62, transparency: 58, correction: 57 },
  "newrepublic.com":      { score: 65, factCheck: 62, editorial: 70, transparency: 66, correction: 63 },
  "propublica.org":       { score: 93, factCheck: 96, editorial: 95, transparency: 92, correction: 90 },
  "theconversation.com":  { score: 88, factCheck: 92, editorial: 90, transparency: 86, correction: 84 },
  "haaretz.com":          { score: 75, factCheck: 78, editorial: 80, transparency: 72, correction: 72 },
  "mirror.co.uk":         { score: 48, factCheck: 44, editorial: 52, transparency: 50, correction: 46 },

  // Center-Left
  "nytimes.com":          { score: 88, factCheck: 92, editorial: 92, transparency: 86, correction: 84 },
  "washingtonpost.com":   { score: 86, factCheck: 90, editorial: 90, transparency: 84, correction: 82 },
  "cnn.com":              { score: 68, factCheck: 70, editorial: 72, transparency: 68, correction: 64, pmiValidated: true },
  "npr.org":              { score: 88, factCheck: 92, editorial: 90, transparency: 86, correction: 84 },
  "pbs.org":              { score: 88, factCheck: 90, editorial: 90, transparency: 87, correction: 85 },
  "bbc.com":              { score: 88, factCheck: 90, editorial: 92, transparency: 86, correction: 84 },
  "bbc.co.uk":            { score: 88, factCheck: 90, editorial: 92, transparency: 86, correction: 84 },
  "theatlantic.com":      { score: 80, factCheck: 82, editorial: 85, transparency: 78, correction: 77 },
  "politico.com":         { score: 80, factCheck: 82, editorial: 83, transparency: 80, correction: 78 },
  "nbcnews.com":          { score: 76, factCheck: 78, editorial: 80, transparency: 74, correction: 72 },
  "cbsnews.com":          { score: 78, factCheck: 80, editorial: 82, transparency: 76, correction: 74 },
  "abcnews.go.com":       { score: 78, factCheck: 80, editorial: 82, transparency: 76, correction: 74 },
  "time.com":             { score: 78, factCheck: 80, editorial: 82, transparency: 76, correction: 74 },
  "axios.com":            { score: 82, factCheck: 84, editorial: 85, transparency: 82, correction: 78 },
  "newyorker.com":        { score: 86, factCheck: 88, editorial: 92, transparency: 84, correction: 82 },
  "businessinsider.com":  { score: 62, factCheck: 60, editorial: 66, transparency: 62, correction: 60 },
  "independent.co.uk":    { score: 68, factCheck: 68, editorial: 72, transparency: 66, correction: 65 },
  "cbc.ca":               { score: 84, factCheck: 86, editorial: 88, transparency: 82, correction: 80 },
  "abc.net.au":           { score: 84, factCheck: 86, editorial: 88, transparency: 82, correction: 80 },
  "smh.com.au":           { score: 76, factCheck: 78, editorial: 80, transparency: 74, correction: 72 },
  "thestar.com":          { score: 74, factCheck: 76, editorial: 78, transparency: 72, correction: 70 },
  "irishtimes.com":       { score: 82, factCheck: 84, editorial: 86, transparency: 80, correction: 78 },

  // Center
  "reuters.com":          { score: 94, factCheck: 96, editorial: 96, transparency: 92, correction: 92 },
  "apnews.com":           { score: 94, factCheck: 96, editorial: 96, transparency: 92, correction: 92 },
  "thehill.com":          { score: 72, factCheck: 74, editorial: 76, transparency: 72, correction: 68, pmiValidated: true },
  "usatoday.com":         { score: 72, factCheck: 74, editorial: 76, transparency: 70, correction: 68 },
  "bloomberg.com":        { score: 84, factCheck: 86, editorial: 88, transparency: 82, correction: 80 },
  "c-span.org":           { score: 96, factCheck: 98, editorial: 98, transparency: 95, correction: 94 },
  "aljazeera.com":        { score: 72, factCheck: 74, editorial: 76, transparency: 72, correction: 68 },
  "newsweek.com":         { score: 56, factCheck: 54, editorial: 60, transparency: 58, correction: 53, pmiValidated: true },
  "marketwatch.com":      { score: 74, factCheck: 76, editorial: 78, transparency: 72, correction: 70 },
  "foreignpolicy.com":    { score: 82, factCheck: 84, editorial: 86, transparency: 80, correction: 78 },
  "france24.com":         { score: 80, factCheck: 82, editorial: 84, transparency: 78, correction: 76 },
  "dw.com":               { score: 84, factCheck: 86, editorial: 88, transparency: 82, correction: 80 },
  "scmp.com":             { score: 68, factCheck: 68, editorial: 72, transparency: 66, correction: 65 },
  "straitstimes.com":     { score: 72, factCheck: 74, editorial: 76, transparency: 70, correction: 68 },
  "japantimes.co.jp":     { score: 76, factCheck: 78, editorial: 80, transparency: 74, correction: 72 },
  "asia.nikkei.com":      { score: 80, factCheck: 82, editorial: 84, transparency: 78, correction: 76 },
  "timesofisrael.com":    { score: 72, factCheck: 74, editorial: 76, transparency: 70, correction: 68 },
  "theglobeandmail.com":  { score: 80, factCheck: 82, editorial: 84, transparency: 78, correction: 76 },
  "channelnewsasia.com":  { score: 76, factCheck: 78, editorial: 80, transparency: 74, correction: 72 },
  "news.sky.com":         { score: 72, factCheck: 74, editorial: 76, transparency: 70, correction: 68 },
  "ft.com":               { score: 88, factCheck: 90, editorial: 92, transparency: 86, correction: 84 },

  // Center-Right
  "wsj.com":              { score: 84, factCheck: 86, editorial: 90, transparency: 82, correction: 80 },
  "economist.com":        { score: 90, factCheck: 92, editorial: 94, transparency: 88, correction: 86 },
  "forbes.com":           { score: 66, factCheck: 64, editorial: 70, transparency: 66, correction: 64 },
  "nationalreview.com":   { score: 58, factCheck: 56, editorial: 65, transparency: 58, correction: 55 },
  "realclearpolitics.com":{ score: 50, factCheck: 48, editorial: 55, transparency: 52, correction: 48, pmiValidated: true },
  "reason.com":           { score: 65, factCheck: 64, editorial: 70, transparency: 66, correction: 62 },
  "freebeacon.com":       { score: 48, factCheck: 44, editorial: 52, transparency: 50, correction: 46 },
  "spectator.org":        { score: 52, factCheck: 48, editorial: 58, transparency: 52, correction: 50 },
  "thedispatch.com":      { score: 72, factCheck: 74, editorial: 76, transparency: 70, correction: 68 },
  "telegraph.co.uk":      { score: 72, factCheck: 74, editorial: 78, transparency: 70, correction: 68 },
  "thetimes.com":         { score: 76, factCheck: 78, editorial: 82, transparency: 74, correction: 72 },
  "spectator.co.uk":      { score: 62, factCheck: 60, editorial: 68, transparency: 62, correction: 60 },
  "nationalpost.com":     { score: 68, factCheck: 68, editorial: 72, transparency: 66, correction: 65 },
  "theaustralian.com.au": { score: 68, factCheck: 68, editorial: 72, transparency: 66, correction: 65 },

  // Right
  "foxnews.com":          { score: 44, factCheck: 38, editorial: 48, transparency: 44, correction: 42, pmiValidated: true },
  "nypost.com":           { score: 44, factCheck: 38, editorial: 48, transparency: 46, correction: 44 },
  "washingtontimes.com":  { score: 46, factCheck: 42, editorial: 50, transparency: 48, correction: 44 },
  "thefederalist.com":    { score: 38, factCheck: 32, editorial: 42, transparency: 40, correction: 36 },
  "dailywire.com":        { score: 36, factCheck: 30, editorial: 40, transparency: 38, correction: 34 },
  "dailycaller.com":      { score: 38, factCheck: 32, editorial: 42, transparency: 40, correction: 36 },
  "townhall.com":         { score: 40, factCheck: 34, editorial: 44, transparency: 42, correction: 38 },
  "theblaze.com":         { score: 34, factCheck: 28, editorial: 38, transparency: 36, correction: 32 },
  "theamericanconservative.com": { score: 55, factCheck: 52, editorial: 60, transparency: 56, correction: 52 },
  "dailymail.co.uk":      { score: 38, factCheck: 32, editorial: 42, transparency: 40, correction: 36 },

  // Far Right
  "breitbart.com":        { score: 20, factCheck: 14, editorial: 22, transparency: 22, correction: 20 },
  "theepochtimes.com":    { score: 22, factCheck: 16, editorial: 24, transparency: 24, correction: 22 },
  "oann.com":             { score: 18, factCheck: 12, editorial: 20, transparency: 20, correction: 18 },
  "newsmax.com":          { score: 30, factCheck: 24, editorial: 32, transparency: 32, correction: 30 },
  "thegatewaypundit.com": { score: 10, factCheck: 6,  editorial: 12, transparency: 12, correction: 10 },
  "zerohedge.com":        { score: 22, factCheck: 16, editorial: 24, transparency: 24, correction: 22 },
  "infowars.com":         { score: 5,  factCheck: 2,  editorial: 6,  transparency: 6,  correction: 5  },

  // Additional major outlets
  "snopes.com":           { score: 88, factCheck: 95, editorial: 88, transparency: 84, correction: 86 },
  "factcheck.org":        { score: 92, factCheck: 98, editorial: 92, transparency: 88, correction: 90 },
  "politifact.com":       { score: 90, factCheck: 96, editorial: 90, transparency: 86, correction: 88 },
  "mediabiasfactcheck.com":{ score: 82, factCheck: 88, editorial: 82, transparency: 78, correction: 80 },
  "wired.com":            { score: 78, factCheck: 80, editorial: 82, transparency: 76, correction: 74 },
  "techcrunch.com":       { score: 72, factCheck: 72, editorial: 76, transparency: 70, correction: 70 },
  "technologyreview.com": { score: 86, factCheck: 88, editorial: 90, transparency: 84, correction: 82 },
  "scientificamerican.com":{ score: 90, factCheck: 94, editorial: 92, transparency: 87, correction: 88 },
  "nature.com":           { score: 95, factCheck: 98, editorial: 96, transparency: 93, correction: 93 },
  "science.org":          { score: 95, factCheck: 98, editorial: 96, transparency: 93, correction: 93 },
  "pnas.org":             { score: 94, factCheck: 97, editorial: 95, transparency: 92, correction: 92 },
  "washingtonexaminer.com":{ score: 46, factCheck: 42, editorial: 50, transparency: 48, correction: 44 },
  "nymag.com":            { score: 70, factCheck: 72, editorial: 74, transparency: 68, correction: 66 },
  "vanityfair.com":       { score: 68, factCheck: 66, editorial: 74, transparency: 66, correction: 65 },
  "rollingstone.com":     { score: 65, factCheck: 62, editorial: 70, transparency: 64, correction: 62 },
  "buzzfeednews.com":     { score: 70, factCheck: 72, editorial: 74, transparency: 68, correction: 67 },
  "vice.com":             { score: 62, factCheck: 60, editorial: 66, transparency: 62, correction: 60 },
  "mediaite.com":         { score: 55, factCheck: 52, editorial: 60, transparency: 56, correction: 52 },
  "talkingpointsmemo.com":{ score: 62, factCheck: 60, editorial: 66, transparency: 62, correction: 60 },
  "rawstory.com":         { score: 42, factCheck: 38, editorial: 46, transparency: 44, correction: 40 },
  "alternet.org":         { score: 35, factCheck: 30, editorial: 38, transparency: 38, correction: 34 },
  "dailykos.com":         { score: 40, factCheck: 36, editorial: 44, transparency: 42, correction: 38 },
  "redstate.com":         { score: 35, factCheck: 30, editorial: 38, transparency: 38, correction: 34 },
  "powerlineblog.com":    { score: 38, factCheck: 32, editorial: 42, transparency: 40, correction: 38 },
  "pjmedia.com":          { score: 36, factCheck: 30, editorial: 40, transparency: 38, correction: 36 },
  "hotair.com":           { score: 40, factCheck: 36, editorial: 44, transparency: 42, correction: 38 },
  "theweek.com":          { score: 68, factCheck: 68, editorial: 72, transparency: 66, correction: 66 },
  "usmagazine.com":       { score: 40, factCheck: 36, editorial: 44, transparency: 40, correction: 38 },
  "people.com":           { score: 52, factCheck: 50, editorial: 56, transparency: 52, correction: 50 },
  "nydailynews.com":      { score: 52, factCheck: 50, editorial: 56, transparency: 52, correction: 50 },
  "latimes.com":          { score: 80, factCheck: 82, editorial: 84, transparency: 78, correction: 76 },
  "chicagotribune.com":   { score: 76, factCheck: 78, editorial: 80, transparency: 74, correction: 72 },
  "bostonglobe.com":      { score: 82, factCheck: 84, editorial: 86, transparency: 80, correction: 78 },
  "sfchronicle.com":      { score: 78, factCheck: 80, editorial: 82, transparency: 76, correction: 74 },
  "seattletimes.com":     { score: 78, factCheck: 80, editorial: 82, transparency: 76, correction: 74 },
  "denverpost.com":       { score: 72, factCheck: 74, editorial: 76, transparency: 70, correction: 68 },
  "dallasnews.com":       { score: 74, factCheck: 76, editorial: 78, transparency: 72, correction: 70 },
  "houstonchronicle.com": { score: 74, factCheck: 76, editorial: 78, transparency: 72, correction: 70 },
  "miamiherald.com":      { score: 76, factCheck: 78, editorial: 80, transparency: 74, correction: 72 },
  "tampabay.com":         { score: 76, factCheck: 78, editorial: 80, transparency: 74, correction: 72 },
  "orlandosentinel.com":  { score: 68, factCheck: 68, editorial: 72, transparency: 66, correction: 65 },
  "azcentral.com":        { score: 70, factCheck: 72, editorial: 74, transparency: 68, correction: 66 },
  "startribune.com":      { score: 74, factCheck: 76, editorial: 78, transparency: 72, correction: 70 },
  "statesman.com":        { score: 70, factCheck: 72, editorial: 74, transparency: 68, correction: 66 },
  "timesofindia.indiatimes.com": { score: 58, factCheck: 56, editorial: 62, transparency: 58, correction: 56 },
  "thehindu.com":         { score: 72, factCheck: 74, editorial: 76, transparency: 70, correction: 68 },
  "hindustantimes.com":   { score: 58, factCheck: 56, editorial: 62, transparency: 58, correction: 56 },
  "ndtv.com":             { score: 62, factCheck: 60, editorial: 66, transparency: 62, correction: 60 },
  "dawn.com":             { score: 70, factCheck: 72, editorial: 74, transparency: 68, correction: 66 },
  "thenews.com.pk":       { score: 60, factCheck: 58, editorial: 64, transparency: 60, correction: 58 },
  "arabnews.com":         { score: 52, factCheck: 50, editorial: 56, transparency: 52, correction: 50 },
  "middleeasteye.net":    { score: 58, factCheck: 56, editorial: 62, transparency: 58, correction: 56 },
  "hurriyetdailynews.com":{ score: 56, factCheck: 54, editorial: 60, transparency: 56, correction: 54 },
  "euronews.com":         { score: 74, factCheck: 76, editorial: 78, transparency: 72, correction: 70 },
  "lemonde.fr":           { score: 86, factCheck: 88, editorial: 90, transparency: 84, correction: 82 },
  "lefigaro.fr":          { score: 76, factCheck: 78, editorial: 80, transparency: 74, correction: 72 },
  "spiegel.de":           { score: 86, factCheck: 88, editorial: 90, transparency: 84, correction: 82 },
  "faz.net":              { score: 84, factCheck: 86, editorial: 88, transparency: 82, correction: 80 },
  "elpais.com":           { score: 82, factCheck: 84, editorial: 86, transparency: 80, correction: 78 },

  // Korean
  "chosun.com":           { score: 62, factCheck: 62, editorial: 68, transparency: 60, correction: 58 },
  "joongang.co.kr":       { score: 64, factCheck: 64, editorial: 70, transparency: 62, correction: 60 },
  "donga.com":            { score: 62, factCheck: 62, editorial: 68, transparency: 60, correction: 58 },
  "hani.co.kr":           { score: 68, factCheck: 68, editorial: 72, transparency: 66, correction: 65 },
  "khan.co.kr":           { score: 66, factCheck: 66, editorial: 70, transparency: 64, correction: 63 },
  "news.kbs.co.kr":       { score: 74, factCheck: 76, editorial: 78, transparency: 72, correction: 70 },
  "imnews.imbc.com":      { score: 72, factCheck: 74, editorial: 76, transparency: 70, correction: 68 },
  "news.sbs.co.kr":       { score: 70, factCheck: 72, editorial: 74, transparency: 68, correction: 66 },
  "news.jtbc.co.kr":      { score: 70, factCheck: 72, editorial: 74, transparency: 68, correction: 66 },
  "ytn.co.kr":            { score: 68, factCheck: 70, editorial: 72, transparency: 66, correction: 64 },
  "yna.co.kr":            { score: 76, factCheck: 78, editorial: 80, transparency: 74, correction: 72 },
  "ohmynews.com":         { score: 58, factCheck: 56, editorial: 62, transparency: 58, correction: 56 },
  "ichannela.com":        { score: 58, factCheck: 56, editorial: 62, transparency: 58, correction: 56 },
  "hankyung.com":         { score: 66, factCheck: 66, editorial: 70, transparency: 64, correction: 63 },
  "mk.co.kr":             { score: 64, factCheck: 64, editorial: 68, transparency: 62, correction: 61 },
  "pressian.com":         { score: 60, factCheck: 58, editorial: 64, transparency: 60, correction: 58 },
  "newstapa.org":         { score: 72, factCheck: 76, editorial: 74, transparency: 70, correction: 68 },
  "mediatoday.co.kr":     { score: 62, factCheck: 62, editorial: 66, transparency: 60, correction: 60 },

  // --- US Regional Newspapers ---
  "inquirer.com":         { score: 76, factCheck: 78, editorial: 80, transparency: 74, correction: 72 },  // Philadelphia Inquirer
  "freep.com":            { score: 74, factCheck: 76, editorial: 78, transparency: 72, correction: 70 },  // Detroit Free Press
  "post-gazette.com":     { score: 74, factCheck: 76, editorial: 78, transparency: 72, correction: 70 },  // Pittsburgh Post-Gazette
  "cleveland.com":        { score: 72, factCheck: 74, editorial: 76, transparency: 70, correction: 68 },  // Cleveland Plain Dealer
  "dispatch.com":         { score: 72, factCheck: 74, editorial: 76, transparency: 70, correction: 68 },  // Columbus Dispatch
  "cincinnati.com":       { score: 70, factCheck: 72, editorial: 74, transparency: 68, correction: 66 },  // Cincinnati Enquirer
  "indystar.com":         { score: 70, factCheck: 72, editorial: 74, transparency: 68, correction: 66 },  // Indianapolis Star
  "stltoday.com":         { score: 72, factCheck: 74, editorial: 76, transparency: 70, correction: 68 },  // St. Louis Post-Dispatch
  "kansascity.com":       { score: 72, factCheck: 74, editorial: 76, transparency: 70, correction: 68 },  // Kansas City Star
  "omaha.com":            { score: 70, factCheck: 72, editorial: 74, transparency: 68, correction: 66 },  // Omaha World-Herald
  "desmoinesregister.com":{ score: 72, factCheck: 74, editorial: 76, transparency: 70, correction: 68 },
  "courant.com":          { score: 72, factCheck: 74, editorial: 76, transparency: 70, correction: 68 },  // Hartford Courant
  "providencejournal.com":{ score: 70, factCheck: 72, editorial: 74, transparency: 68, correction: 66 },
  "timesunion.com":       { score: 70, factCheck: 72, editorial: 74, transparency: 68, correction: 66 },  // Albany Times Union
  "recordonline.com":     { score: 62, factCheck: 62, editorial: 66, transparency: 60, correction: 60 },
  "buffalonews.com":      { score: 72, factCheck: 74, editorial: 76, transparency: 70, correction: 68 },  // Buffalo News
  "democratandchronicle.com": { score: 70, factCheck: 72, editorial: 74, transparency: 68, correction: 66 }, // Rochester Democrat & Chronicle
  "newsobserver.com":     { score: 74, factCheck: 76, editorial: 78, transparency: 72, correction: 70 },  // Raleigh News & Observer
  "charlotteobserver.com":{ score: 74, factCheck: 76, editorial: 78, transparency: 72, correction: 70 },
  "thestate.com":         { score: 70, factCheck: 72, editorial: 74, transparency: 68, correction: 66 },  // Columbia State (SC)
  "ajc.com":              { score: 74, factCheck: 76, editorial: 78, transparency: 72, correction: 70 },  // Atlanta Journal-Constitution
  "tennessean.com":       { score: 70, factCheck: 72, editorial: 74, transparency: 68, correction: 66 },  // The Tennessean (Nashville)
  "courier-journal.com":  { score: 72, factCheck: 74, editorial: 76, transparency: 70, correction: 68 },  // Louisville Courier-Journal
  "jsonline.com":         { score: 74, factCheck: 76, editorial: 78, transparency: 72, correction: 70 },  // Milwaukee Journal Sentinel
  "detroitnews.com":      { score: 70, factCheck: 72, editorial: 74, transparency: 68, correction: 66 },
  "sacbee.com":           { score: 72, factCheck: 74, editorial: 76, transparency: 70, correction: 68 },  // Sacramento Bee
  "mercurynews.com":      { score: 74, factCheck: 76, editorial: 78, transparency: 72, correction: 70 },  // San Jose Mercury News
  "sandiegouniontribune.com": { score: 74, factCheck: 76, editorial: 78, transparency: 72, correction: 70 },
  "sun-sentinel.com":     { score: 72, factCheck: 74, editorial: 76, transparency: 70, correction: 68 },  // South Florida Sun Sentinel
  "palmbeachpost.com":    { score: 70, factCheck: 72, editorial: 74, transparency: 68, correction: 66 },
  "abqjournal.com":       { score: 68, factCheck: 68, editorial: 72, transparency: 66, correction: 65 },  // Albuquerque Journal
  "reviewjournal.com":    { score: 66, factCheck: 66, editorial: 70, transparency: 64, correction: 63 },  // Las Vegas Review-Journal
  "oregonlive.com":       { score: 72, factCheck: 74, editorial: 76, transparency: 70, correction: 68 },  // The Oregonian
  "spokesman.com":        { score: 70, factCheck: 72, editorial: 74, transparency: 68, correction: 66 },  // Spokesman-Review (Spokane)
  "idahostatesman.com":   { score: 68, factCheck: 68, editorial: 72, transparency: 66, correction: 65 },
  "arkansasonline.com":   { score: 68, factCheck: 68, editorial: 72, transparency: 66, correction: 65 },  // Arkansas Democrat-Gazette
  "nola.com":             { score: 72, factCheck: 74, editorial: 76, transparency: 70, correction: 68 },  // New Orleans Times-Picayune
  "theadvocate.com":      { score: 72, factCheck: 74, editorial: 76, transparency: 70, correction: 68 },  // Baton Rouge Advocate
  "oklahoman.com":        { score: 66, factCheck: 66, editorial: 70, transparency: 64, correction: 63 },
  "tulsaworld.com":       { score: 68, factCheck: 68, editorial: 72, transparency: 66, correction: 65 },
  "alreporter.com":       { score: 68, factCheck: 68, editorial: 72, transparency: 66, correction: 65 },  // Alabama Reporter (AL.com)
  "al.com":               { score: 70, factCheck: 72, editorial: 74, transparency: 68, correction: 66 },
  "postandcourier.com":   { score: 72, factCheck: 74, editorial: 76, transparency: 70, correction: 68 },  // Charleston Post and Courier
  "virginiapilot.com":    { score: 70, factCheck: 72, editorial: 74, transparency: 68, correction: 66 },
  "richmond.com":         { score: 70, factCheck: 72, editorial: 74, transparency: 68, correction: 66 },  // Richmond Times-Dispatch
  "baltimoresun.com":     { score: 74, factCheck: 76, editorial: 78, transparency: 72, correction: 70 },
  "northjersey.com":      { score: 68, factCheck: 68, editorial: 72, transparency: 66, correction: 65 },

  // --- Wire Services & Press Agencies ---
  "afp.com":              { score: 93, factCheck: 96, editorial: 95, transparency: 92, correction: 90 },  // Agence France-Presse
  "upi.com":              { score: 82, factCheck: 84, editorial: 86, transparency: 80, correction: 78 },  // United Press International
  "prnewswire.com":       { score: 50, factCheck: 48, editorial: 55, transparency: 52, correction: 48 },  // PR Newswire (press releases)
  "businesswire.com":     { score: 50, factCheck: 48, editorial: 55, transparency: 52, correction: 48 },
  "globenewswire.com":    { score: 48, factCheck: 46, editorial: 52, transparency: 50, correction: 46 },
  "kyodonews.net":        { score: 86, factCheck: 88, editorial: 88, transparency: 84, correction: 82 },  // Kyodo News (Japan)
  "xinhuanet.com":        { score: 28, factCheck: 22, editorial: 30, transparency: 30, correction: 28 },  // Xinhua (Chinese state)
  "cgtn.com":             { score: 24, factCheck: 18, editorial: 26, transparency: 26, correction: 24 },  // CGTN (Chinese state TV)
  "tass.com":             { score: 20, factCheck: 14, editorial: 22, transparency: 22, correction: 20 },  // TASS (Russian state)
  "rt.com":               { score: 14, factCheck: 8,  editorial: 15, transparency: 15, correction: 14 },  // Russia Today
  "efe.com":              { score: 82, factCheck: 84, editorial: 86, transparency: 80, correction: 78 },  // EFE (Spanish wire)
  "reuters.co.uk":        { score: 94, factCheck: 96, editorial: 96, transparency: 92, correction: 92 },

  // --- Fact-Checkers & Accountability Journalism ---
  "fullfact.org":         { score: 94, factCheck: 98, editorial: 94, transparency: 90, correction: 92 },  // UK fact-checker
  "afchecks.org":         { score: 90, factCheck: 95, editorial: 90, transparency: 88, correction: 88 },  // AFP Fact Check
  "checkyourfact.com":    { score: 70, factCheck: 76, editorial: 72, transparency: 68, correction: 66 },
  "leadstories.com":      { score: 74, factCheck: 80, editorial: 74, transparency: 72, correction: 70 },
  "verafiles.org":        { score: 88, factCheck: 92, editorial: 88, transparency: 86, correction: 84 },  // Philippines
  "rappler.com":          { score: 78, factCheck: 82, editorial: 80, transparency: 76, correction: 74 },  // Philippines
  "boomlive.in":          { score: 84, factCheck: 90, editorial: 84, transparency: 82, correction: 80 },  // India fact-check
  "altnews.in":           { score: 80, factCheck: 86, editorial: 80, transparency: 78, correction: 76 },  // India fact-check
  "africacheck.org":      { score: 90, factCheck: 95, editorial: 90, transparency: 88, correction: 88 },  // Africa fact-checker
  "pesacheck.org":        { score: 86, factCheck: 92, editorial: 86, transparency: 84, correction: 82 },  // East Africa
  "dubawa.org":           { score: 84, factCheck: 90, editorial: 84, transparency: 82, correction: 80 },  // West Africa

  // --- Policy / Think Tanks / Wonk Outlets ---
  "brookings.edu":        { score: 88, factCheck: 90, editorial: 90, transparency: 87, correction: 85 },
  "rand.org":             { score: 90, factCheck: 92, editorial: 92, transparency: 88, correction: 88 },
  "cfr.org":              { score: 88, factCheck: 90, editorial: 90, transparency: 86, correction: 86 },  // Council on Foreign Relations
  "pewresearch.org":      { score: 94, factCheck: 96, editorial: 94, transparency: 93, correction: 92 },
  "urban.org":            { score: 88, factCheck: 90, editorial: 90, transparency: 87, correction: 85 },  // Urban Institute
  "cbpp.org":             { score: 82, factCheck: 86, editorial: 84, transparency: 80, correction: 80 },  // Center on Budget and Policy Priorities
  "heritage.org":         { score: 58, factCheck: 56, editorial: 64, transparency: 58, correction: 55 },  // Heritage Foundation
  "cato.org":             { score: 68, factCheck: 70, editorial: 72, transparency: 66, correction: 65 },  // Cato Institute
  "aei.org":              { score: 64, factCheck: 64, editorial: 70, transparency: 62, correction: 61 },  // American Enterprise Institute
  "americanprogress.org": { score: 62, factCheck: 62, editorial: 68, transparency: 60, correction: 58 },  // Center for American Progress
  "thirdway.org":         { score: 70, factCheck: 72, editorial: 74, transparency: 68, correction: 68 },
  "iiss.org":             { score: 88, factCheck: 90, editorial: 90, transparency: 86, correction: 86 },  // International Institute for Strategic Studies
  "icij.org":             { score: 92, factCheck: 96, editorial: 94, transparency: 90, correction: 90 },  // International Consortium of Investigative Journalists
  "irpi.eu":              { score: 86, factCheck: 90, editorial: 88, transparency: 84, correction: 82 },  // IRPI investigative
  "occrp.org":            { score: 90, factCheck: 94, editorial: 92, transparency: 88, correction: 88 },  // Organized Crime and Corruption Reporting Project
  "wilsoncenter.org":     { score: 84, factCheck: 86, editorial: 86, transparency: 82, correction: 82 },
  "stimson.org":          { score: 84, factCheck: 86, editorial: 86, transparency: 82, correction: 82 },
  "chathamhouse.org":     { score: 88, factCheck: 90, editorial: 90, transparency: 86, correction: 86 },
  "sipri.org":            { score: 90, factCheck: 92, editorial: 92, transparency: 88, correction: 88 },  // Stockholm International Peace Research
  "icg.org":              { score: 88, factCheck: 90, editorial: 90, transparency: 86, correction: 86 },  // International Crisis Group
  "foreignaffairs.com":   { score: 88, factCheck: 90, editorial: 92, transparency: 86, correction: 84 },
  "nationalinterest.org": { score: 66, factCheck: 66, editorial: 70, transparency: 64, correction: 63 },
  "defensenews.com":      { score: 78, factCheck: 80, editorial: 82, transparency: 76, correction: 74 },
  "lawfaremedia.org":     { score: 88, factCheck: 90, editorial: 90, transparency: 86, correction: 86 },
  "justsecurity.org":     { score: 84, factCheck: 86, editorial: 86, transparency: 82, correction: 82 },
  "themarkup.org":        { score: 90, factCheck: 94, editorial: 92, transparency: 88, correction: 88 },  // Tech accountability journalism
  "restofworld.org":      { score: 84, factCheck: 86, editorial: 86, transparency: 82, correction: 82 },  // Tech in the Global South
  "cyberscoop.com":       { score: 76, factCheck: 78, editorial: 80, transparency: 74, correction: 72 },

  // --- Tech / Business Outlets ---
  "arstechnica.com":      { score: 82, factCheck: 84, editorial: 86, transparency: 80, correction: 78 },
  "theverge.com":         { score: 78, factCheck: 80, editorial: 82, transparency: 76, correction: 74 },
  "engadget.com":         { score: 72, factCheck: 72, editorial: 76, transparency: 70, correction: 70 },
  "cnet.com":             { score: 70, factCheck: 70, editorial: 74, transparency: 68, correction: 68 },
  "zdnet.com":            { score: 70, factCheck: 70, editorial: 74, transparency: 68, correction: 68 },
  "venturebeat.com":      { score: 66, factCheck: 64, editorial: 70, transparency: 64, correction: 63 },
  "gizmodo.com":          { score: 62, factCheck: 60, editorial: 66, transparency: 62, correction: 60 },
  "mashable.com":         { score: 58, factCheck: 56, editorial: 62, transparency: 58, correction: 56 },
  "pcmag.com":            { score: 70, factCheck: 70, editorial: 74, transparency: 68, correction: 68 },
  "tomsguide.com":        { score: 62, factCheck: 60, editorial: 66, transparency: 60, correction: 60 },
  "9to5mac.com":          { score: 66, factCheck: 64, editorial: 70, transparency: 64, correction: 63 },
  "macrumors.com":        { score: 66, factCheck: 64, editorial: 70, transparency: 64, correction: 63 },
  "theinformation.com":   { score: 82, factCheck: 84, editorial: 86, transparency: 80, correction: 78 },
  "protocol.com":         { score: 78, factCheck: 80, editorial: 82, transparency: 76, correction: 74 },
  "semafor.com":          { score: 78, factCheck: 80, editorial: 82, transparency: 76, correction: 74 },
  "404media.co":          { score: 80, factCheck: 82, editorial: 84, transparency: 78, correction: 76 },  // Tech accountability
  "platformer.news":      { score: 80, factCheck: 82, editorial: 84, transparency: 78, correction: 76 },  // Casey Newton
  "hardcoreware.net":     { score: 58, factCheck: 56, editorial: 62, transparency: 56, correction: 55 },
  "fortune.com":          { score: 72, factCheck: 72, editorial: 76, transparency: 70, correction: 70 },
  "inc.com":              { score: 62, factCheck: 60, editorial: 66, transparency: 60, correction: 60 },
  "fastcompany.com":      { score: 68, factCheck: 68, editorial: 72, transparency: 66, correction: 65 },
  "hbr.org":              { score: 80, factCheck: 82, editorial: 84, transparency: 78, correction: 76 },  // Harvard Business Review
  "qz.com":               { score: 72, factCheck: 72, editorial: 76, transparency: 70, correction: 70 },  // Quartz
  "morningbrew.com":      { score: 66, factCheck: 64, editorial: 70, transparency: 64, correction: 63 },
  "cryptoslate.com":      { score: 42, factCheck: 38, editorial: 46, transparency: 44, correction: 40 },
  "coindesk.com":         { score: 62, factCheck: 60, editorial: 66, transparency: 62, correction: 60 },
  "decrypt.co":           { score: 60, factCheck: 58, editorial: 64, transparency: 60, correction: 58 },

  // --- Health & Science Outlets ---
  "statnews.com":         { score: 88, factCheck: 92, editorial: 90, transparency: 86, correction: 84 },
  "thelancet.com":        { score: 94, factCheck: 97, editorial: 96, transparency: 92, correction: 92 },
  "bmj.com":              { score: 94, factCheck: 97, editorial: 96, transparency: 92, correction: 92 },
  "nejm.org":             { score: 95, factCheck: 98, editorial: 97, transparency: 93, correction: 93 },  // New England Journal of Medicine
  "jamanetwork.com":      { score: 94, factCheck: 97, editorial: 96, transparency: 92, correction: 92 },  // JAMA
  "cell.com":             { score: 94, factCheck: 97, editorial: 95, transparency: 92, correction: 92 },
  "medscape.com":         { score: 80, factCheck: 84, editorial: 82, transparency: 78, correction: 76 },
  "webmd.com":            { score: 68, factCheck: 70, editorial: 72, transparency: 66, correction: 65 },
  "healthline.com":       { score: 70, factCheck: 72, editorial: 74, transparency: 68, correction: 66 },
  "mayoclinic.org":       { score: 88, factCheck: 92, editorial: 90, transparency: 86, correction: 84 },
  "nih.gov":              { score: 92, factCheck: 96, editorial: 94, transparency: 90, correction: 90 },
  "cdc.gov":              { score: 90, factCheck: 94, editorial: 92, transparency: 88, correction: 88 },
  "who.int":              { score: 88, factCheck: 92, editorial: 90, transparency: 86, correction: 84 },
  "sciencedaily.com":     { score: 72, factCheck: 74, editorial: 76, transparency: 70, correction: 68 },  // Press release aggregator
  "newscientist.com":     { score: 82, factCheck: 84, editorial: 86, transparency: 80, correction: 78 },
  "livescience.com":      { score: 70, factCheck: 72, editorial: 74, transparency: 68, correction: 66 },
  "quantamagazine.org":   { score: 90, factCheck: 93, editorial: 92, transparency: 88, correction: 87 },
  "undark.org":           { score: 86, factCheck: 90, editorial: 88, transparency: 84, correction: 82 },
  "insideclimatenews.org":{ score: 84, factCheck: 88, editorial: 86, transparency: 82, correction: 80 },
  "carbonbrief.org":      { score: 86, factCheck: 90, editorial: 88, transparency: 84, correction: 82 },
  "e360.yale.edu":        { score: 86, factCheck: 90, editorial: 88, transparency: 84, correction: 82 },  // Yale Environment 360
  "climatecentral.org":   { score: 86, factCheck: 90, editorial: 88, transparency: 84, correction: 82 },
  "oceana.org":           { score: 70, factCheck: 72, editorial: 74, transparency: 68, correction: 66 },  // Advocacy + journalism mix

  // --- Sports Outlets ---
  "espn.com":             { score: 74, factCheck: 76, editorial: 78, transparency: 72, correction: 70 },
  "theathletic.com":      { score: 82, factCheck: 84, editorial: 86, transparency: 80, correction: 78 },
  "si.com":               { score: 70, factCheck: 72, editorial: 74, transparency: 68, correction: 66 },  // Sports Illustrated
  "bleacherreport.com":   { score: 58, factCheck: 56, editorial: 62, transparency: 58, correction: 56 },
  "nbcsports.com":        { score: 72, factCheck: 74, editorial: 76, transparency: 70, correction: 68 },
  "cbssports.com":        { score: 70, factCheck: 72, editorial: 74, transparency: 68, correction: 66 },
  "foxsports.com":        { score: 62, factCheck: 60, editorial: 66, transparency: 62, correction: 60 },
  "sportingnews.com":     { score: 66, factCheck: 66, editorial: 70, transparency: 64, correction: 63 },
  "deadspin.com":         { score: 58, factCheck: 56, editorial: 62, transparency: 58, correction: 56 },
  "defector.com":         { score: 72, factCheck: 74, editorial: 76, transparency: 70, correction: 68 },

  // --- Entertainment & Culture That Do News ---
  "variety.com":          { score: 72, factCheck: 72, editorial: 76, transparency: 70, correction: 70 },
  "hollywoodreporter.com":{ score: 72, factCheck: 72, editorial: 76, transparency: 70, correction: 70 },
  "deadline.com":         { score: 68, factCheck: 66, editorial: 72, transparency: 66, correction: 65 },
  "entertainmentweekly.com":{ score: 58, factCheck: 56, editorial: 62, transparency: 58, correction: 56 },
  "vulture.com":          { score: 64, factCheck: 62, editorial: 68, transparency: 62, correction: 61 },
  "pitchfork.com":        { score: 64, factCheck: 62, editorial: 68, transparency: 62, correction: 61 },
  "consequence.net":      { score: 60, factCheck: 58, editorial: 64, transparency: 58, correction: 57 },
  "avclub.com":           { score: 62, factCheck: 60, editorial: 66, transparency: 60, correction: 60 },
  "indiewire.com":        { score: 64, factCheck: 62, editorial: 68, transparency: 62, correction: 61 },
  "screendaily.com":      { score: 68, factCheck: 66, editorial: 72, transparency: 66, correction: 65 },

  // --- Digital-Native / Substack-Adjacent Outlets ---
  "discoursemagazine.com":{ score: 68, factCheck: 68, editorial: 72, transparency: 66, correction: 65 },
  "persuasion.community": { score: 70, factCheck: 70, editorial: 74, transparency: 68, correction: 66 },
  "noahpinion.substack.com":{ score: 72, factCheck: 74, editorial: 76, transparency: 70, correction: 68 },
  "slowboring.com":       { score: 72, factCheck: 74, editorial: 76, transparency: 70, correction: 68 },  // Matt Yglesias
  "astralcodexten.substack.com":{ score: 74, factCheck: 76, editorial: 78, transparency: 72, correction: 70 },
  "nymag.com/intelligencer":{ score: 70, factCheck: 72, editorial: 74, transparency: 68, correction: 66 },
  "grid.news":            { score: 76, factCheck: 78, editorial: 80, transparency: 74, correction: 72 },
  "publico.es":           { score: 52, factCheck: 50, editorial: 56, transparency: 52, correction: 50 },
  "hellgatenyc.com":      { score: 68, factCheck: 68, editorial: 72, transparency: 66, correction: 65 },
  "missouriindependent.com":{ score: 78, factCheck: 80, editorial: 82, transparency: 76, correction: 74 },
  "texastribune.org":     { score: 82, factCheck: 84, editorial: 86, transparency: 80, correction: 78 },
  "spotlightpa.org":      { score: 84, factCheck: 88, editorial: 86, transparency: 82, correction: 80 },
  "calmatters.org":       { score: 82, factCheck: 84, editorial: 86, transparency: 80, correction: 78 },
  "coloradosun.com":      { score: 78, factCheck: 80, editorial: 82, transparency: 76, correction: 74 },
  "vtdigger.org":         { score: 78, factCheck: 80, editorial: 82, transparency: 76, correction: 74 },
  "nevadacurrent.com":    { score: 74, factCheck: 76, editorial: 78, transparency: 72, correction: 70 },
  "gothamist.com":        { score: 72, factCheck: 74, editorial: 76, transparency: 70, correction: 68 },
  "laist.com":            { score: 72, factCheck: 74, editorial: 76, transparency: 70, correction: 68 },
  "capitolbroadcasting.com":{ score: 68, factCheck: 68, editorial: 72, transparency: 66, correction: 65 },
  "militarytimes.com":    { score: 74, factCheck: 76, editorial: 78, transparency: 72, correction: 70 },

  // --- International English-Language: Africa ---
  "dailymaverick.co.za":  { score: 80, factCheck: 82, editorial: 84, transparency: 78, correction: 76 },  // South Africa
  "news24.com":           { score: 66, factCheck: 66, editorial: 70, transparency: 64, correction: 63 },  // South Africa
  "iol.co.za":            { score: 60, factCheck: 58, editorial: 64, transparency: 60, correction: 58 },  // South Africa
  "groundup.org.za":      { score: 82, factCheck: 86, editorial: 84, transparency: 80, correction: 78 },  // South Africa accountability
  "amabhungane.co.za":    { score: 86, factCheck: 90, editorial: 88, transparency: 84, correction: 82 },  // South Africa investigative
  "premiumtimesng.com":   { score: 72, factCheck: 74, editorial: 76, transparency: 70, correction: 68 },  // Nigeria
  "punchng.com":          { score: 62, factCheck: 60, editorial: 66, transparency: 62, correction: 60 },  // Nigeria
  "vanguardngr.com":      { score: 58, factCheck: 56, editorial: 62, transparency: 58, correction: 56 },  // Nigeria
  "thecable.ng":          { score: 70, factCheck: 72, editorial: 74, transparency: 68, correction: 66 },  // Nigeria
  "thenationonlineng.net":{ score: 58, factCheck: 56, editorial: 62, transparency: 58, correction: 56 },  // Nigeria
  "nairobinews.nation.africa":{ score: 68, factCheck: 68, editorial: 72, transparency: 66, correction: 65 }, // Kenya
  "nation.africa":        { score: 68, factCheck: 68, editorial: 72, transparency: 66, correction: 65 },  // Kenya
  "standardmedia.co.ke":  { score: 62, factCheck: 60, editorial: 66, transparency: 62, correction: 60 },  // Kenya
  "theeastafrican.co.ke": { score: 70, factCheck: 72, editorial: 74, transparency: 68, correction: 66 },
  "monitor.co.ug":        { score: 66, factCheck: 66, editorial: 70, transparency: 64, correction: 63 },  // Uganda
  "allafrica.com":        { score: 62, factCheck: 62, editorial: 66, transparency: 60, correction: 60 },
  "enca.com":             { score: 66, factCheck: 66, editorial: 70, transparency: 64, correction: 63 },  // eNCA South Africa
  "ewn.co.za":            { score: 70, factCheck: 72, editorial: 74, transparency: 68, correction: 66 },  // Eyewitness News South Africa
  "mg.co.za":             { score: 78, factCheck: 80, editorial: 82, transparency: 76, correction: 74 },  // Mail & Guardian South Africa
  "businesslive.co.za":   { score: 70, factCheck: 72, editorial: 74, transparency: 68, correction: 66 },

  // --- International English-Language: South & Southeast Asia ---
  "scroll.in":            { score: 76, factCheck: 78, editorial: 80, transparency: 74, correction: 72 },  // India
  "thewire.in":           { score: 72, factCheck: 74, editorial: 76, transparency: 70, correction: 68 },  // India
  "thequint.com":         { score: 68, factCheck: 68, editorial: 72, transparency: 66, correction: 65 },  // India
  "outlookindia.com":     { score: 62, factCheck: 60, editorial: 66, transparency: 62, correction: 60 },  // India
  "firstpost.com":        { score: 52, factCheck: 50, editorial: 56, transparency: 52, correction: 50 },  // India (right-leaning)
  "theprint.in":          { score: 70, factCheck: 72, editorial: 74, transparency: 68, correction: 66 },  // India
  "frontline.thehindu.com":{ score: 76, factCheck: 78, editorial: 80, transparency: 74, correction: 72 }, // India
  "asianews.it":          { score: 66, factCheck: 66, editorial: 70, transparency: 64, correction: 63 },
  "khmertimeskh.com":     { score: 46, factCheck: 42, editorial: 50, transparency: 48, correction: 44 },  // Cambodia (state-aligned)
  "bangkokpost.com":      { score: 68, factCheck: 68, editorial: 72, transparency: 66, correction: 65 },  // Thailand
  "nationthailand.com":   { score: 62, factCheck: 60, editorial: 66, transparency: 62, correction: 60 },  // Thailand
  "mmtimes.com":          { score: 56, factCheck: 54, editorial: 60, transparency: 56, correction: 54 },  // Myanmar
  "irrawaddy.com":        { score: 74, factCheck: 76, editorial: 78, transparency: 72, correction: 70 },  // Myanmar (independent)
  "malaymail.com":        { score: 62, factCheck: 60, editorial: 66, transparency: 62, correction: 60 },  // Malaysia
  "freemalaysiatoday.com":{ score: 62, factCheck: 60, editorial: 66, transparency: 62, correction: 60 },  // Malaysia
  "malaysiakini.com":     { score: 74, factCheck: 76, editorial: 78, transparency: 72, correction: 70 },  // Malaysia (independent)
  "thejakartapost.com":   { score: 70, factCheck: 72, editorial: 74, transparency: 68, correction: 66 },  // Indonesia
  "vnanet.vn":            { score: 22, factCheck: 16, editorial: 24, transparency: 24, correction: 22 },  // Vietnam News Agency (state)
  "tuoitrenews.vn":       { score: 44, factCheck: 40, editorial: 48, transparency: 46, correction: 42 },  // Vietnam
  "phnom-penh-post.com":  { score: 44, factCheck: 40, editorial: 48, transparency: 46, correction: 42 },  // Cambodia
  "dailystar.com.lb":     { score: 62, factCheck: 60, editorial: 66, transparency: 62, correction: 60 },  // Lebanon

  // --- International English-Language: Middle East ---
  "thetimes.co.uk":       { score: 76, factCheck: 78, editorial: 82, transparency: 74, correction: 72 },  // Times of London
  "thejc.com":            { score: 66, factCheck: 66, editorial: 70, transparency: 64, correction: 63 },  // Jewish Chronicle
  "jpost.com":            { score: 62, factCheck: 60, editorial: 66, transparency: 62, correction: 60 },  // Jerusalem Post
  "naharnet.com":         { score: 58, factCheck: 56, editorial: 62, transparency: 58, correction: 56 },  // Lebanon
  "ahramonline.org":      { score: 40, factCheck: 36, editorial: 44, transparency: 42, correction: 38 },  // Egypt (state-aligned)
  "jordantimes.com":      { score: 54, factCheck: 52, editorial: 58, transparency: 54, correction: 52 },
  "gulfnews.com":         { score: 54, factCheck: 52, editorial: 58, transparency: 54, correction: 52 },  // UAE
  "khaleejtimes.com":     { score: 52, factCheck: 50, editorial: 56, transparency: 52, correction: 50 },  // UAE
  "thenationalnews.com":  { score: 60, factCheck: 58, editorial: 64, transparency: 60, correction: 58 },  // UAE (Abu Dhabi)
  "rudaw.net":            { score: 62, factCheck: 60, editorial: 66, transparency: 62, correction: 60 },  // Kurdish news

  // --- International English-Language: Europe & Oceania ---
  "euractiv.com":         { score: 78, factCheck: 80, editorial: 82, transparency: 76, correction: 74 },  // EU policy
  "politico.eu":          { score: 80, factCheck: 82, editorial: 84, transparency: 78, correction: 76 },
  "thelocal.se":          { score: 70, factCheck: 72, editorial: 74, transparency: 68, correction: 66 },  // Sweden in English
  "thelocal.de":          { score: 70, factCheck: 72, editorial: 74, transparency: 68, correction: 66 },  // Germany in English
  "thelocal.fr":          { score: 70, factCheck: 72, editorial: 74, transparency: 68, correction: 66 },  // France in English
  "balkaninsight.com":    { score: 80, factCheck: 82, editorial: 84, transparency: 78, correction: 76 },  // BIRN
  "intellinews.com":      { score: 68, factCheck: 68, editorial: 72, transparency: 66, correction: 65 },  // CEE business
  "kyivindependent.com":  { score: 76, factCheck: 78, editorial: 80, transparency: 74, correction: 72 },  // Ukraine
  "meduza.io":            { score: 78, factCheck: 80, editorial: 82, transparency: 76, correction: 74 },  // Russia (independent exile)
  "rferl.org":            { score: 82, factCheck: 84, editorial: 86, transparency: 80, correction: 78 },  // Radio Free Europe
  "nzherald.co.nz":       { score: 72, factCheck: 74, editorial: 76, transparency: 70, correction: 68 },  // New Zealand
  "rnz.co.nz":            { score: 82, factCheck: 84, editorial: 86, transparency: 80, correction: 78 },  // Radio New Zealand
  "stuff.co.nz":          { score: 66, factCheck: 66, editorial: 70, transparency: 64, correction: 63 },  // New Zealand
  "theage.com.au":        { score: 76, factCheck: 78, editorial: 80, transparency: 74, correction: 72 },  // Australia
  "afr.com":              { score: 80, factCheck: 82, editorial: 84, transparency: 78, correction: 76 },  // Australian Financial Review
  "crikey.com.au":        { score: 72, factCheck: 74, editorial: 76, transparency: 70, correction: 68 },  // Australia
  "thesaturdaypaper.com.au":{ score: 76, factCheck: 78, editorial: 80, transparency: 74, correction: 72 },
  "canadianpress.com":    { score: 88, factCheck: 90, editorial: 90, transparency: 86, correction: 84 },  // The Canadian Press wire
  "nationalobserver.com": { score: 76, factCheck: 78, editorial: 80, transparency: 74, correction: 72 },  // Canada
  "thetyee.ca":           { score: 72, factCheck: 74, editorial: 76, transparency: 70, correction: 68 },  // Canada (BC)

  // --- Public Broadcasters & International TV ---
  "rte.ie":               { score: 82, factCheck: 84, editorial: 86, transparency: 80, correction: 78 },  // Ireland
  "abc.es":               { score: 62, factCheck: 60, editorial: 66, transparency: 62, correction: 60 },  // Spain (right)
  "tvnz.co.nz":           { score: 78, factCheck: 80, editorial: 82, transparency: 76, correction: 74 },  // New Zealand TV
  "sbs.com.au":           { score: 82, factCheck: 84, editorial: 86, transparency: 80, correction: 78 },  // Australia SBS
  "dw.com/en":            { score: 84, factCheck: 86, editorial: 88, transparency: 82, correction: 80 },
  "nhk.or.jp/nhkworld":   { score: 84, factCheck: 86, editorial: 88, transparency: 82, correction: 80 },  // NHK World
  "voanews.com":          { score: 76, factCheck: 78, editorial: 80, transparency: 74, correction: 72 },  // Voice of America
  "pri.org":              { score: 82, factCheck: 84, editorial: 86, transparency: 80, correction: 78 },  // Public Radio International
  "theworld.org":         { score: 82, factCheck: 84, editorial: 86, transparency: 80, correction: 78 },
  "arajazeera.net":       { score: 72, factCheck: 74, editorial: 76, transparency: 72, correction: 68 },
  "swissinfo.ch":         { score: 82, factCheck: 84, editorial: 86, transparency: 80, correction: 78 },  // Swiss Broadcasting Corp
  "tvp.info":             { score: 40, factCheck: 36, editorial: 44, transparency: 42, correction: 38 },  // Poland (state-controlled)
  "abc.go.com":           { score: 78, factCheck: 80, editorial: 82, transparency: 76, correction: 74 },

  // --- Latin America / Caribbean ---
  "infobae.com":          { score: 60, factCheck: 58, editorial: 64, transparency: 60, correction: 58 },  // Argentina
  "lanacion.com.ar":      { score: 64, factCheck: 64, editorial: 68, transparency: 62, correction: 61 },  // Argentina
  "clarin.com":           { score: 56, factCheck: 54, editorial: 60, transparency: 56, correction: 54 },  // Argentina
  "folha.uol.com.br":     { score: 72, factCheck: 74, editorial: 76, transparency: 70, correction: 68 },  // Brazil
  "agenciapauta.org":     { score: 70, factCheck: 72, editorial: 74, transparency: 68, correction: 66 },
  "eluniversal.com.mx":   { score: 60, factCheck: 58, editorial: 64, transparency: 60, correction: 58 },  // Mexico
  "proceso.com.mx":       { score: 72, factCheck: 74, editorial: 76, transparency: 70, correction: 68 },  // Mexico
  "laprensa.hn":          { score: 56, factCheck: 54, editorial: 60, transparency: 56, correction: 54 },  // Honduras
  "ticotimes.net":        { score: 70, factCheck: 72, editorial: 74, transparency: 68, correction: 66 },  // Costa Rica (English)
  "mercopress.com":       { score: 68, factCheck: 68, editorial: 72, transparency: 66, correction: 65 },  // South America (English)
  "colombiareports.com":  { score: 66, factCheck: 66, editorial: 70, transparency: 64, correction: 63 },  // Colombia (English)
  "jamaicaobserver.com":  { score: 62, factCheck: 60, editorial: 66, transparency: 62, correction: 60 },
  "trinidadexpress.com":  { score: 60, factCheck: 58, editorial: 64, transparency: 60, correction: 58 },
  "caribbeannationalweekly.com":{ score: 54, factCheck: 52, editorial: 58, transparency: 54, correction: 52 },

  // --- Legal & Government / Academic ---
  "scotusblog.com":       { score: 90, factCheck: 93, editorial: 92, transparency: 88, correction: 88 },
  "govtrack.us":          { score: 88, factCheck: 90, editorial: 90, transparency: 86, correction: 86 },
  "congress.gov":         { score: 95, factCheck: 98, editorial: 97, transparency: 94, correction: 93 },
  "gao.gov":              { score: 94, factCheck: 97, editorial: 96, transparency: 92, correction: 92 },
  "cbo.gov":              { score: 94, factCheck: 97, editorial: 96, transparency: 92, correction: 92 },
  "census.gov":           { score: 94, factCheck: 97, editorial: 96, transparency: 92, correction: 92 },
  "bls.gov":              { score: 94, factCheck: 97, editorial: 96, transparency: 92, correction: 92 },
  "theconversation.com/us":{ score: 88, factCheck: 92, editorial: 90, transparency: 86, correction: 84 },
  "academia.edu":         { score: 68, factCheck: 70, editorial: 72, transparency: 66, correction: 65 },  // Preprint/repository
  "ssrn.com":             { score: 72, factCheck: 74, editorial: 74, transparency: 70, correction: 68 },  // Preprint
  "arxiv.org":            { score: 80, factCheck: 82, editorial: 82, transparency: 78, correction: 76 },  // Physics/CS preprint

  // --- Podcasting & Audio-Native (websites) ---
  "crooked.com":          { score: 64, factCheck: 62, editorial: 68, transparency: 62, correction: 61 },  // Crooked Media (Pod Save America)
  "stitcher.com":         { score: 50, factCheck: 48, editorial: 54, transparency: 50, correction: 48 },  // Directory
  "gimletmedia.com":      { score: 72, factCheck: 74, editorial: 76, transparency: 70, correction: 68 },
  "wondery.com":          { score: 62, factCheck: 60, editorial: 66, transparency: 62, correction: 60 },
  "iheart.com":           { score: 50, factCheck: 48, editorial: 54, transparency: 50, correction: 48 },
  "thisamericanlife.org": { score: 84, factCheck: 86, editorial: 88, transparency: 82, correction: 80 },
  "radiolab.org":         { score: 84, factCheck: 86, editorial: 88, transparency: 82, correction: 80 },
  "revealnews.org":       { score: 88, factCheck: 92, editorial: 90, transparency: 86, correction: 84 },  // CIR investigative
  "99percentinvisible.org":{ score: 80, factCheck: 82, editorial: 84, transparency: 78, correction: 76 },
  "freakonomics.com":     { score: 72, factCheck: 74, editorial: 76, transparency: 70, correction: 68 },

  // --- Economics & Finance Deep-Dive ---
  "econbrowser.com":      { score: 80, factCheck: 82, editorial: 84, transparency: 78, correction: 76 },
  "calculatedriskblog.com":{ score: 80, factCheck: 82, editorial: 84, transparency: 78, correction: 76 },
  "marginalrevolution.com":{ score: 74, factCheck: 76, editorial: 78, transparency: 72, correction: 70 },
  "voxeu.org":            { score: 86, factCheck: 88, editorial: 90, transparency: 84, correction: 82 },  // CEPR
  "nber.org":             { score: 92, factCheck: 95, editorial: 94, transparency: 90, correction: 90 },  // National Bureau of Economic Research
  "imf.org":              { score: 88, factCheck: 90, editorial: 92, transparency: 86, correction: 86 },
  "worldbank.org":        { score: 88, factCheck: 90, editorial: 92, transparency: 86, correction: 86 },
  "piie.com":             { score: 86, factCheck: 88, editorial: 90, transparency: 84, correction: 82 },  // Peterson Institute
  "ft.com/alphaville":    { score: 86, factCheck: 88, editorial: 90, transparency: 84, correction: 82 },
  "barrons.com":          { score: 78, factCheck: 80, editorial: 82, transparency: 76, correction: 74 },
  "cnbc.com":             { score: 70, factCheck: 70, editorial: 74, transparency: 68, correction: 68 },
  "thestreet.com":        { score: 58, factCheck: 56, editorial: 62, transparency: 58, correction: 56 },
  "seekingalpha.com":     { score: 50, factCheck: 48, editorial: 54, transparency: 50, correction: 48 },  // User-generated finance
  "investopedia.com":     { score: 68, factCheck: 68, editorial: 72, transparency: 66, correction: 65 },

  // --- Religion & Ethics ---
  "ncronline.org":        { score: 72, factCheck: 74, editorial: 76, transparency: 70, correction: 68 },  // National Catholic Reporter
  "americamagazine.org":  { score: 74, factCheck: 76, editorial: 78, transparency: 72, correction: 70 },  // America (Jesuit)
  "firstthings.com":      { score: 64, factCheck: 62, editorial: 68, transparency: 62, correction: 61 },
  "christianitytoday.com":{ score: 66, factCheck: 66, editorial: 70, transparency: 64, correction: 63 },
  "religionnews.com":     { score: 78, factCheck: 80, editorial: 82, transparency: 76, correction: 74 },
  "catholicculture.org":  { score: 58, factCheck: 56, editorial: 62, transparency: 58, correction: 56 },
  "forward.com":          { score: 72, factCheck: 74, editorial: 76, transparency: 70, correction: 68 },  // Jewish news
  "cruxnow.com":          { score: 68, factCheck: 68, editorial: 72, transparency: 66, correction: 65 },  // Catholic news

  // --- Education & Philanthropy ---
  "edweek.org":           { score: 80, factCheck: 82, editorial: 84, transparency: 78, correction: 76 },  // Education Week
  "chronicle.com":        { score: 82, factCheck: 84, editorial: 86, transparency: 80, correction: 78 },  // Chronicle of Higher Education
  "insidehighered.com":   { score: 78, factCheck: 80, editorial: 82, transparency: 76, correction: 74 },
  "hechingereport.org":   { score: 82, factCheck: 84, editorial: 86, transparency: 80, correction: 78 },
  "chalkbeat.org":        { score: 80, factCheck: 82, editorial: 84, transparency: 78, correction: 76 },
  "philanthropy.com":     { score: 74, factCheck: 76, editorial: 78, transparency: 72, correction: 70 },
  "nonprofitquarterly.org":{ score: 74, factCheck: 76, editorial: 78, transparency: 72, correction: 70 },

  // --- Local & Hyperlocal Journalism ---
  "voiceofsandiego.org":  { score: 82, factCheck: 84, editorial: 86, transparency: 80, correction: 78 },
  "bridgedetroit.com":    { score: 78, factCheck: 80, editorial: 82, transparency: 76, correction: 74 },
  "thecity.nyc":          { score: 82, factCheck: 84, editorial: 86, transparency: 80, correction: 78 },
  "bklyner.com":          { score: 68, factCheck: 68, editorial: 72, transparency: 66, correction: 65 },
  "documentedny.com":     { score: 78, factCheck: 80, editorial: 82, transparency: 76, correction: 74 },  // NYC immigration
  "richmondconfidential.org":{ score: 70, factCheck: 72, editorial: 74, transparency: 68, correction: 66 },
  "billmoyers.com":       { score: 60, factCheck: 58, editorial: 64, transparency: 60, correction: 58 },

  // --- Miscellaneous Influential Outlets ---
  "courier.typepad.com":  { score: 44, factCheck: 40, editorial: 48, transparency: 44, correction: 42 },
  "americanthinker.com":  { score: 28, factCheck: 22, editorial: 30, transparency: 30, correction: 28 },
  "frontpagemag.com":     { score: 20, factCheck: 14, editorial: 22, transparency: 22, correction: 20 },
  "wnd.com":              { score: 18, factCheck: 12, editorial: 20, transparency: 20, correction: 18 },  // WorldNetDaily
  "lifezette.com":        { score: 24, factCheck: 18, editorial: 26, transparency: 26, correction: 24 },
  "naturalblaze.com":     { score: 16, factCheck: 10, editorial: 18, transparency: 18, correction: 16 },  // Pseudoscience
  "naturalnews.com":      { score: 8,  factCheck: 4,  editorial: 10, transparency: 10, correction: 8  },  // Conspiracy/pseudoscience
  "globalresearch.ca":    { score: 12, factCheck: 6,  editorial: 14, transparency: 14, correction: 12 },  // Conspiracy
  "mintpressnews.com":    { score: 16, factCheck: 10, editorial: 18, transparency: 18, correction: 16 },
  "activistpost.com":     { score: 14, factCheck: 8,  editorial: 16, transparency: 16, correction: 14 },
  "socialistworker.org":  { score: 42, factCheck: 38, editorial: 46, transparency: 44, correction: 40 },
  "wsws.org":             { score: 38, factCheck: 32, editorial: 42, transparency: 40, correction: 36 },  // World Socialist
  "sputniknews.com":      { score: 12, factCheck: 6,  editorial: 14, transparency: 14, correction: 12 },  // Russian state propaganda
  "presstv.ir":           { score: 10, factCheck: 4,  editorial: 12, transparency: 12, correction: 10 },  // Iranian state
  "english.alarabiya.net":{ score: 52, factCheck: 50, editorial: 56, transparency: 52, correction: 50 },  // Saudi-owned
  "themoscowtimes.com":   { score: 70, factCheck: 72, editorial: 74, transparency: 68, correction: 66 },  // Russia (independent)
  "bellingcat.com":       { score: 88, factCheck: 92, editorial: 90, transparency: 86, correction: 84 },  // Open-source investigation
  "logically.ai":         { score: 80, factCheck: 86, editorial: 82, transparency: 78, correction: 76 },  // AI-assisted fact-checking
  "misbar.com":           { score: 78, factCheck: 82, editorial: 80, transparency: 76, correction: 74 },  // Arab world fact-check
  "correctiv.org":        { score: 86, factCheck: 90, editorial: 88, transparency: 84, correction: 82 },  // Germany investigative
  "openmediaresearch.org":{ score: 80, factCheck: 84, editorial: 82, transparency: 78, correction: 76 },
};

/**
 * Get credibility data for a domain.
 * @param {string} domain - cleaned domain (no www.)
 * @returns {{ score: number, factCheck: number, editorial: number, transparency: number, correction: number } | null}
 */
function getCredibilityScore(domain) {
  return CREDIBILITY_DB[domain] || null;
}

/**
 * Get credibility label from score.
 * @param {number} score
 * @returns {"high"|"medium"|"low"|"unknown"}
 */
function getCredibilityLabel(score) {
  if (score >= 80) return "high";
  if (score >= 50) return "medium";
  if (score >= 20) return "low";
  return "unknown";
}

// Make available for both service worker (globalThis) and content scripts
if (typeof globalThis !== "undefined") {
  globalThis.getCredibilityScore = getCredibilityScore;
  globalThis.getCredibilityLabel = getCredibilityLabel;
  globalThis.CREDIBILITY_DB = CREDIBILITY_DB;
}

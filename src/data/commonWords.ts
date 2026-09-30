import { CommonWord, Rendering } from './learnTypes';

// Ordered by usefulness, following Ferriss's "selection" idea: the small set of
// words that covers most everyday speech comes first. New words in practice
// sessions are introduced in this order.
// Translations drafted with AI help. Sindhi and Gujarati especially should be checked by a native speaker.

type Indic = [romanised: string, native: string];
type SindhiPair = [romanised: string, arabic: string, devanagari: string];

let seq = 0;
function w(theme: string, english: string, nl: string, es: string, hi: Indic, sd: SindhiPair, gu: Indic): CommonWord {
  seq += 1;
  const indic = ([r, n]: Indic): Rendering => ({ r, n });
  return {
    id: `w${seq}`,
    english,
    theme,
    tr: {
      Dutch: { r: nl },
      Spanish: { r: es },
      Hindi: indic(hi),
      Sindhi: { r: sd[0], n: sd[1], d: sd[2] },
      Gujarati: indic(gu),
    },
  };
}

export const commonWords: CommonWord[] = [
  // Basics
  w('Basics', 'yes', 'ja', 'sí', ['haan', 'हाँ'], ['haa', 'ها', 'हा'], ['haa', 'હા']),
  w('Basics', 'no', 'nee', 'no', ['nahin', 'नहीं'], ['na', 'نه', 'न'], ['na', 'ના']),
  w('Basics', 'hello', 'hallo', 'hola', ['namaste', 'नमस्ते'], ['salaam', 'سلام', 'सलाम'], ['kem chho', 'કેમ છો']),
  w('Basics', 'thank you', 'dank je', 'gracias', ['dhanyavaad', 'धन्यवाद'], ['meharbaani', 'مهرباني', 'मेहरबानी'], ['aabhaar', 'આભાર']),
  w('Basics', 'please', 'alsjeblieft', 'por favor', ['kripya', 'कृपया'], ['meharbaani kare', 'مهرباني ڪري', 'मेहरबानी करे'], ['maherbaani kari', 'મહેરબાની કરી']),
  w('Basics', 'sorry', 'sorry', 'lo siento', ['maaf kijiye', 'माफ़ कीजिए'], ['maaf kajo', 'معاف ڪجو', 'माफ़ कजो'], ['maaf karjo', 'માફ કરજો']),
  w('Basics', 'goodbye', 'tot ziens', 'adiós', ['alvida', 'अलविदा'], ['khuda haafiz', 'خدا حافظ', 'ख़ुदा हाफ़िज़'], ['aavjo', 'આવજો']),
  w('Basics', 'okay', 'oké', 'vale', ['theek hai', 'ठीक है'], ['theek aahe', 'ٺيڪ آهي', 'ठीक आहे'], ['barabar', 'બરાબર']),

  // People
  w('People', 'I', 'ik', 'yo', ['main', 'मैं'], ['maan', 'مان', 'मां'], ['hu', 'હું']),
  w('People', 'you', 'jij', 'tú', ['tum', 'तुम'], ['tavhaan', 'توهان', 'तव्हां'], ['tame', 'તમે']),
  w('People', 'he', 'hij', 'él', ['woh', 'वह'], ['hoo', 'هو', 'हू'], ['te', 'તે']),
  w('People', 'she', 'zij', 'ella', ['woh', 'वह'], ['hoa', 'هوءَ', 'हूअ'], ['te', 'તે']),
  w('People', 'we', 'wij', 'nosotros', ['hum', 'हम'], ['asaan', 'اسان', 'असां'], ['ame', 'અમે']),
  w('People', 'they', 'zij', 'ellos', ['ve', 'वे'], ['uhe', 'اُهي', 'उहे'], ['teo', 'તેઓ']),

  // Questions
  w('Questions', 'what', 'wat', 'qué', ['kya', 'क्या'], ['chha', 'ڇا', 'छा'], ['shu', 'શું']),
  w('Questions', 'who', 'wie', 'quién', ['kaun', 'कौन'], ['keru', 'ڪير', 'केरु'], ['kon', 'કોણ']),
  w('Questions', 'where', 'waar', 'dónde', ['kahaan', 'कहाँ'], ['kithe', 'ڪٿي', 'किथे'], ['kya', 'ક્યાં']),
  w('Questions', 'when', 'wanneer', 'cuándo', ['kab', 'कब'], ['kaḍahin', 'ڪڏهن', 'कॾहिं'], ['kyaare', 'ક્યારે']),
  w('Questions', 'why', 'waarom', 'por qué', ['kyon', 'क्यों'], ['chho', 'ڇو', 'छो'], ['kem', 'કેમ']),
  w('Questions', 'how', 'hoe', 'cómo', ['kaise', 'कैसे'], ['kiyan', 'ڪيئن', 'कीअं'], ['kevi rite', 'કેવી રીતે']),
  w('Questions', 'how much', 'hoeveel', 'cuánto', ['kitna', 'कितना'], ['kitro', 'ڪيترو', 'कितिरो'], ['ketlu', 'કેટલું']),
  w('Questions', 'which', 'welke', 'cuál', ['kaunsa', 'कौनसा'], ['kehro', 'ڪهڙو', 'कहिड़ो'], ['kayu', 'કયું']),

  // Core verbs
  w('Verbs', 'to be', 'zijn', 'ser / estar', ['hona', 'होना'], ['hujaṇu', 'هجڻ', 'हुजणु'], ['hovu', 'હોવું']),
  w('Verbs', 'to have', 'hebben', 'tener', ['paas hona', 'पास होना'], ['vaṭi hujaṇu', 'وٽ هجڻ', 'वटि हुजणु'], ['paase hovu', 'પાસે હોવું']),
  w('Verbs', 'to do / make', 'doen', 'hacer', ['karna', 'करना'], ['karaṇu', 'ڪرڻ', 'करणु'], ['karvu', 'કરવું']),
  w('Verbs', 'to go', 'gaan', 'ir', ['jaana', 'जाना'], ['vañaṇu', 'وڃڻ', 'वञणु'], ['javu', 'જવું']),
  w('Verbs', 'to come', 'komen', 'venir', ['aana', 'आना'], ['achaṇu', 'اچڻ', 'अचणु'], ['aavvu', 'આવવું']),
  w('Verbs', 'to want', 'willen', 'querer', ['chaahna', 'चाहना'], ['chaahaṇu', 'چاهڻ', 'चाहणु'], ['ichchhvu', 'ઇચ્છવું']),
  w('Verbs', 'to give', 'geven', 'dar', ['dena', 'देना'], ['ḍiyaṇu', 'ڏيڻ', 'ॾियणु'], ['aapvu', 'આપવું']),
  w('Verbs', 'to take', 'nemen', 'tomar', ['lena', 'लेना'], ['vaṭhaṇu', 'وٺڻ', 'वठणु'], ['levu', 'લેવું']),
  w('Verbs', 'can / be able to', 'kunnen', 'poder', ['sakna', 'सकना'], ['sagaṇu', 'سگهڻ', 'सघणु'], ['shakvu', 'શકવું']),
  w('Verbs', 'to need', 'nodig hebben', 'necesitar', ['zaroorat hona', 'ज़रूरत होना'], ['zaroorat hujaṇu', 'ضرورت هجڻ', 'ज़रूरत हुजणु'], ['jaroor padvi', 'જરૂર પડવી']),
  w('Verbs', 'to know', 'weten', 'saber', ['jaanna', 'जानना'], ['jaaṇaṇu', 'ڄاڻڻ', 'ॼाणणु'], ['jaaṇvu', 'જાણવું']),
  w('Verbs', 'to say', 'zeggen', 'decir', ['kehna', 'कहना'], ['chawaṇu', 'چوڻ', 'चवणु'], ['kehvu', 'કહેવું']),
  w('Verbs', 'to speak', 'spreken', 'hablar', ['bolna', 'बोलना'], ['gaalhaaiṇu', 'ڳالهائڻ', 'ॻाल्हाइणु'], ['bolvu', 'બોલવું']),
  w('Verbs', 'to understand', 'begrijpen', 'entender', ['samajhna', 'समझना'], ['samajhaṇu', 'سمجهڻ', 'समुझणु'], ['samajvu', 'સમજવું']),
  w('Verbs', 'to eat', 'eten', 'comer', ['khaana', 'खाना'], ['khaaiṇu', 'کائڻ', 'खाइणु'], ['khaavu', 'ખાવું']),
  w('Verbs', 'to drink', 'drinken', 'beber', ['peena', 'पीना'], ['piyaṇu', 'پيئڻ', 'पीअणु'], ['pivu', 'પીવું']),
  w('Verbs', 'to see', 'zien', 'ver', ['dekhna', 'देखना'], ['ḍisaṇu', 'ڏسڻ', 'ॾिसणु'], ['jovu', 'જોવું']),
  w('Verbs', 'to like', 'leuk vinden', 'gustar', ['pasand karna', 'पसंद करना'], ['pasand karaṇu', 'پسند ڪرڻ', 'पसंद करणु'], ['gamvu', 'ગમવું']),
  w('Verbs', 'to live', 'wonen', 'vivir', ['rehna', 'रहना'], ['rahaṇu', 'رهڻ', 'रहणु'], ['rehvu', 'રહેવું']),
  w('Verbs', 'to work', 'werken', 'trabajar', ['kaam karna', 'काम करना'], ['kamu karaṇu', 'ڪم ڪرڻ', 'कमु करणु'], ['kaam karvu', 'કામ કરવું']),
  w('Verbs', 'to sleep', 'slapen', 'dormir', ['sona', 'सोना'], ['sumhaṇu', 'سمهڻ', 'सुम्हणु'], ['suvu', 'સૂવું']),
  w('Verbs', 'to learn', 'leren', 'aprender', ['seekhna', 'सीखना'], ['sikhaṇu', 'سکڻ', 'सिखणु'], ['shikhvu', 'શીખવું']),
  w('Verbs', 'to help', 'helpen', 'ayudar', ['madad karna', 'मदद करना'], ['madad karaṇu', 'مدد ڪرڻ', 'मदद करणु'], ['madad karvi', 'મદદ કરવી']),
  w('Verbs', 'to buy', 'kopen', 'comprar', ['khareedna', 'ख़रीदना'], ['khareed karaṇu', 'خريد ڪرڻ', 'ख़रीद करणु'], ['kharidvu', 'ખરીદવું']),
  w('Verbs', 'to read', 'lezen', 'leer', ['padhna', 'पढ़ना'], ['paṛhaṇu', 'پڙهڻ', 'पढ़णु'], ['vaanchvu', 'વાંચવું']),
  w('Verbs', 'to write', 'schrijven', 'escribir', ['likhna', 'लिखना'], ['likhaṇu', 'لکڻ', 'लिखणु'], ['lakhvu', 'લખવું']),
  w('Verbs', 'to think', 'denken', 'pensar', ['sochna', 'सोचना'], ['sochaṇu', 'سوچڻ', 'सोचणु'], ['vichaarvu', 'વિચારવું']),
  w('Verbs', 'to love', 'houden van', 'amar', ['pyaar karna', 'प्यार करना'], ['pyaar karaṇu', 'پيار ڪرڻ', 'प्यार करणु'], ['prem karvo', 'પ્રેમ કરવો']),
  w('Verbs', 'to wait', 'wachten', 'esperar', ['intezaar karna', 'इंतज़ार करना'], ['intezaar karaṇu', 'انتظار ڪرڻ', 'इंतज़ार करणु'], ['raah jovi', 'રાહ જોવી']),
  w('Verbs', 'to walk', 'lopen', 'caminar', ['chalna', 'चलना'], ['hilaṇu', 'هلڻ', 'हलणु'], ['chaalvu', 'ચાલવું']),
  w('Verbs', 'to open', 'openen', 'abrir', ['kholna', 'खोलना'], ['kholaṇu', 'کولڻ', 'खोलणु'], ['kholvu', 'ખોલવું']),
  w('Verbs', 'to cook', 'koken', 'cocinar', ['pakaana', 'पकाना'], ['randhaṇu', 'رڌڻ', 'रधणु'], ['raandhvu', 'રાંધવું']),

  // Little words
  w('Little words', 'and', 'en', 'y', ['aur', 'और'], ['ain', '۽', 'ऐं'], ['ane', 'અને']),
  w('Little words', 'or', 'of', 'o', ['ya', 'या'], ['ya', 'يا', 'या'], ['athva', 'અથવા']),
  w('Little words', 'but', 'maar', 'pero', ['lekin', 'लेकिन'], ['par', 'پر', 'पर'], ['pan', 'પણ']),
  w('Little words', 'because', 'omdat', 'porque', ['kyonki', 'क्योंकि'], ['chho ta', 'ڇو ته', 'छो त'], ['kaaraṇ ke', 'કારણ કે']),
  w('Little words', 'not', 'niet', 'no', ['nahin', 'नहीं'], ['na', 'نه', 'न'], ['nahi', 'નહીં']),
  w('Little words', 'this', 'dit', 'esto', ['yeh', 'यह'], ['hee', 'هي', 'ही'], ['aa', 'આ']),
  w('Little words', 'that', 'dat', 'eso', ['woh', 'वह'], ['uho', 'اهو', 'उहो'], ['pelu', 'પેલું']),
  w('Little words', 'here', 'hier', 'aquí', ['yahaan', 'यहाँ'], ['hite', 'هِتي', 'हिते'], ['ahin', 'અહીં']),
  w('Little words', 'there', 'daar', 'allí', ['wahaan', 'वहाँ'], ['hute', 'هُتي', 'हुते'], ['tya', 'ત્યાં']),
  w('Little words', 'with', 'met', 'con', ['ke saath', 'के साथ'], ['saan', 'سان', 'सां'], ['saathe', 'સાથે']),
  w('Little words', 'without', 'zonder', 'sin', ['ke bina', 'के बिना'], ['bina', 'بنا', 'बिना'], ['vagar', 'વગર']),
  w('Little words', 'also', 'ook', 'también', ['bhi', 'भी'], ['bi', 'به', 'बि'], ['pan', 'પણ']),
  w('Little words', 'only', 'alleen', 'solo', ['sirf', 'सिर्फ़'], ['rugo', 'رڳو', 'रुॻो'], ['phakt', 'ફક્ત']),
  w('Little words', 'again', 'weer', 'otra vez', ['phir', 'फिर'], ['vari', 'وري', 'वरी'], ['pharithi', 'ફરીથી']),
  w('Little words', 'very', 'heel', 'muy', ['bahut', 'बहुत'], ['ḍaadho', 'ڏاڍو', 'ॾाढो'], ['bahu', 'બહુ']),
  w('Little words', 'a lot / many', 'veel', 'mucho', ['bahut saara', 'बहुत सारा'], ['ghaṇo', 'گهڻو', 'घणो'], ['ghanu', 'ઘણું']),
  w('Little words', 'a little', 'een beetje', 'un poco', ['thoda', 'थोड़ा'], ['thoro', 'ٿورو', 'थोरो'], ['thodu', 'થોડું']),
  w('Little words', 'more', 'meer', 'más', ['zyaada', 'ज़्यादा'], ['wadhiik', 'وڌيڪ', 'वधीक'], ['vadhaare', 'વધારે']),

  // Time
  w('Time', 'today', 'vandaag', 'hoy', ['aaj', 'आज'], ['aju', 'اڄ', 'अॼु'], ['aaje', 'આજે']),
  w('Time', 'tomorrow', 'morgen', 'mañana', ['kal (aane wala)', 'कल'], ['subhaaṇe', 'سڀاڻي', 'सुभाणे'], ['kaale (aavti)', 'કાલે']),
  w('Time', 'yesterday', 'gisteren', 'ayer', ['kal (beeta hua)', 'कल'], ['kaalh', 'ڪالهه', 'काल्ह'], ['gaikaale', 'ગઈકાલે']),
  w('Time', 'now', 'nu', 'ahora', ['ab', 'अब'], ['haaṇe', 'هاڻي', 'हाणे'], ['hamṇa', 'હમણાં']),
  w('Time', 'later', 'later', 'después', ['baad mein', 'बाद में'], ['poe', 'پوءِ', 'पोइ'], ['pachhi', 'પછી']),
  w('Time', 'time', 'tijd', 'tiempo', ['samay', 'समय'], ['vaqtu', 'وقت', 'वक़्तु'], ['samay', 'સમય']),
  w('Time', 'day', 'dag', 'día', ['din', 'दिन'], ['ḍeenhu', 'ڏينهن', 'ॾींहु'], ['divas', 'દિવસ']),
  w('Time', 'night', 'nacht', 'noche', ['raat', 'रात'], ['raati', 'رات', 'राति'], ['raat', 'રાત']),
  w('Time', 'morning', 'ochtend', 'mañana (la)', ['subah', 'सुबह'], ['subuh', 'صبح', 'सुबुह'], ['savaar', 'સવાર']),
  w('Time', 'week', 'week', 'semana', ['hafta', 'हफ़्ता'], ['hafto', 'هفتو', 'हफ़्तो'], ['athvaadiyu', 'અઠવાડિયું']),
  w('Time', 'year', 'jaar', 'año', ['saal', 'साल'], ['saal', 'سال', 'साल'], ['varas', 'વરસ']),
  w('Time', 'always', 'altijd', 'siempre', ['hamesha', 'हमेशा'], ['hamesha', 'هميشه', 'हमेशा'], ['hammesha', 'હંમેશા']),
  w('Time', 'never', 'nooit', 'nunca', ['kabhi nahin', 'कभी नहीं'], ['kaḍahin na', 'ڪڏهن نه', 'कॾहिं न'], ['kyaarey nahi', 'ક્યારેય નહીં']),
  w('Time', 'sometimes', 'soms', 'a veces', ['kabhi kabhi', 'कभी कभी'], ['kaḍahin kaḍahin', 'ڪڏهن ڪڏهن', 'कॾहिं कॾहिं'], ['kyaarek', 'ક્યારેક']),

  // Family
  w('Family', 'mother', 'moeder', 'madre', ['maa', 'माँ'], ['maau', 'ماءُ', 'माउ'], ['maa', 'મા']),
  w('Family', 'father', 'vader', 'padre', ['pitaa', 'पिता'], ['piu', 'پيءُ', 'पीउ'], ['pita', 'પિતા']),
  w('Family', 'brother', 'broer', 'hermano', ['bhai', 'भाई'], ['bhaau', 'ڀاءُ', 'भाउ'], ['bhai', 'ભાઈ']),
  w('Family', 'sister', 'zus', 'hermana', ['behen', 'बहन'], ['bheṇu', 'ڀيڻ', 'भेण'], ['bahen', 'બહેન']),
  w('Family', 'child', 'kind', 'niño', ['bachcha', 'बच्चा'], ['baaru', 'ٻار', 'ॿारु'], ['baalak', 'બાળક']),
  w('Family', 'friend', 'vriend', 'amigo', ['dost', 'दोस्त'], ['dost', 'دوست', 'दोस्त'], ['mitra', 'મિત્ર']),
  w('Family', 'family', 'familie', 'familia', ['parivaar', 'परिवार'], ['kuṭumbu', 'ڪٽنب', 'कुटुंबु'], ['parivaar', 'પરિવાર']),
  w('Family', 'man', 'man', 'hombre', ['aadmi', 'आदमी'], ['mard', 'مرد', 'मर्द'], ['purush', 'પુરુષ']),
  w('Family', 'woman', 'vrouw', 'mujer', ['aurat', 'औरत'], ['aurat', 'عورت', 'औरत'], ['stree', 'સ્ત્રી']),
  w('Family', 'name', 'naam', 'nombre', ['naam', 'नाम'], ['naalo', 'نالو', 'नालो'], ['naam', 'નામ']),

  // Food & home
  w('Food & home', 'water', 'water', 'agua', ['paani', 'पानी'], ['paaṇi', 'پاڻي', 'पाणी'], ['paaṇi', 'પાણી']),
  w('Food & home', 'food', 'eten', 'comida', ['khaana', 'खाना'], ['khaadho', 'کاڌو', 'खाधो'], ['khaavanu', 'ખાવાનું']),
  w('Food & home', 'bread / roti', 'brood', 'pan', ['roti', 'रोटी'], ['maani', 'ماني', 'मानी'], ['rotli', 'રોટલી']),
  w('Food & home', 'rice', 'rijst', 'arroz', ['chaawal', 'चावल'], ['chaanvar', 'چانور', 'चांवर'], ['bhaat', 'ભાત']),
  w('Food & home', 'tea', 'thee', 'té', ['chai', 'चाय'], ['chaanh', 'چانهه', 'चांह'], ['chaa', 'ચા']),
  w('Food & home', 'coffee', 'koffie', 'café', ['coffee', 'कॉफ़ी'], ['coffee', 'ڪافي', 'काफ़ी'], ['coffee', 'કોફી']),
  w('Food & home', 'milk', 'melk', 'leche', ['doodh', 'दूध'], ['kheeru', 'کير', 'खीरु'], ['doodh', 'દૂધ']),
  w('Food & home', 'fruit', 'fruit', 'fruta', ['phal', 'फल'], ['meevo', 'ميوو', 'मेवो'], ['phal', 'ફળ']),
  w('Food & home', 'house', 'huis', 'casa', ['ghar', 'घर'], ['gharu', 'گهر', 'घरु'], ['ghar', 'ઘર']),
  w('Food & home', 'room', 'kamer', 'habitación', ['kamra', 'कमरा'], ['kamro', 'ڪمرو', 'कमिरो'], ['ordo', 'ઓરડો']),
  w('Food & home', 'door', 'deur', 'puerta', ['darvaaza', 'दरवाज़ा'], ['daru', 'در', 'दरु'], ['baarnu', 'બારણું']),
  w('Food & home', 'bed', 'bed', 'cama', ['bistar', 'बिस्तर'], ['khaṭu', 'کٽ', 'खटु'], ['pathaari', 'પથારી']),
  w('Food & home', 'phone', 'telefoon', 'teléfono', ['phone', 'फ़ोन'], ['phone', 'فون', 'फ़ोन'], ['phone', 'ફોન']),
  w('Food & home', 'book', 'boek', 'libro', ['kitaab', 'किताब'], ['kitaab', 'ڪتاب', 'किताब'], ['chopdi', 'ચોપડી']),
  w('Food & home', 'money', 'geld', 'dinero', ['paisa', 'पैसा'], ['paisa', 'پئسا', 'पैसा'], ['paisa', 'પૈસા']),

  // Out and about
  w('Out and about', 'work (job)', 'werk', 'trabajo', ['kaam', 'काम'], ['kamu', 'ڪم', 'कमु'], ['kaam', 'કામ']),
  w('Out and about', 'shop', 'winkel', 'tienda', ['dukaan', 'दुकान'], ['dukaan', 'دڪان', 'दुकान'], ['dukaan', 'દુકાન']),
  w('Out and about', 'street / road', 'straat', 'calle', ['sadak', 'सड़क'], ['rasto', 'رستو', 'रस्तो'], ['rasto', 'રસ્તો']),
  w('Out and about', 'city', 'stad', 'ciudad', ['shahar', 'शहर'], ['shaharu', 'شهر', 'शहरु'], ['shaher', 'શહેર']),
  w('Out and about', 'country', 'land', 'país', ['desh', 'देश'], ['mulku', 'ملڪ', 'मुल्कु'], ['desh', 'દેશ']),
  w('Out and about', 'language', 'taal', 'idioma', ['bhasha', 'भाषा'], ['boli', 'ٻولي', 'ॿोली'], ['bhasha', 'ભાષા']),
  w('Out and about', 'school', 'school', 'escuela', ['school', 'स्कूल'], ['school', 'اسڪول', 'स्कूल'], ['shaala', 'શાળા']),
  w('Out and about', 'car', 'auto', 'coche', ['gaadi', 'गाड़ी'], ['gaaḍi', 'گاڏي', 'गाॾी'], ['gaadi', 'ગાડી']),
  w('Out and about', 'sun', 'zon', 'sol', ['sooraj', 'सूरज'], ['siju', 'سج', 'सिजु'], ['suraj', 'સૂરજ']),
  w('Out and about', 'rain', 'regen', 'lluvia', ['baarish', 'बारिश'], ['meenhu', 'مينهن', 'मींहुं'], ['varsaad', 'વરસાદ']),
  w('Out and about', 'dog', 'hond', 'perro', ['kutta', 'कुत्ता'], ['kuto', 'ڪتو', 'कुतो'], ['kutro', 'કૂતરો']),
  w('Out and about', 'cat', 'kat', 'gato', ['billi', 'बिल्ली'], ['bili', 'ٻلي', 'ॿिली'], ['bilaadi', 'બિલાડી']),

  // Body
  w('Body', 'hand', 'hand', 'mano', ['haath', 'हाथ'], ['hathu', 'هٿ', 'हथु'], ['haath', 'હાથ']),
  w('Body', 'eye', 'oog', 'ojo', ['aankh', 'आँख'], ['akhi', 'اک', 'अखि'], ['aankh', 'આંખ']),
  w('Body', 'head', 'hoofd', 'cabeza', ['sir', 'सिर'], ['siru', 'سر', 'सिरु'], ['maathu', 'માથું']),

  // Describing
  w('Describing', 'good', 'goed', 'bueno', ['achchha', 'अच्छा'], ['suṭho', 'سٺو', 'सुठो'], ['saaru', 'સારું']),
  w('Describing', 'bad', 'slecht', 'malo', ['bura', 'बुरा'], ['kharaab', 'خراب', 'ख़राब'], ['kharaab', 'ખરાબ']),
  w('Describing', 'big', 'groot', 'grande', ['bada', 'बड़ा'], ['vaḍo', 'وڏو', 'वॾो'], ['motu', 'મોટું']),
  w('Describing', 'small', 'klein', 'pequeño', ['chhota', 'छोटा'], ['nandho', 'ننڍو', 'नंढो'], ['naanu', 'નાનું']),
  w('Describing', 'new', 'nieuw', 'nuevo', ['naya', 'नया'], ['nawon', 'نئون', 'नओं'], ['navu', 'નવું']),
  w('Describing', 'old', 'oud', 'viejo', ['puraana', 'पुराना'], ['puraaṇo', 'پراڻو', 'पुराणो'], ['juunu', 'જૂનું']),
  w('Describing', 'hot', 'heet', 'caliente', ['garam', 'गरम'], ['garamu', 'گرم', 'गरमु'], ['garam', 'ગરમ']),
  w('Describing', 'cold', 'koud', 'frío', ['thanda', 'ठंडा'], ['thadho', 'ٿڌو', 'थधो'], ['thandu', 'ઠંડું']),
  w('Describing', 'happy', 'blij', 'feliz', ['khush', 'ख़ुश'], ['khush', 'خوش', 'ख़ुश'], ['khush', 'ખુશ']),
  w('Describing', 'beautiful', 'mooi', 'bonito', ['sundar', 'सुंदर'], ['sohṇo', 'سهڻو', 'सुहिणो'], ['sundar', 'સુંદર']),
  w('Describing', 'fast', 'snel', 'rápido', ['tez', 'तेज़'], ['tezu', 'تيز', 'तेज़ु'], ['jhadpi', 'ઝડપી']),
  w('Describing', 'slow', 'langzaam', 'lento', ['dheere', 'धीरे'], ['aahistaa', 'آهستي', 'आहिस्ते'], ['dhimu', 'ધીમું']),
  w('Describing', 'easy', 'makkelijk', 'fácil', ['aasaan', 'आसान'], ['aasaan', 'آسان', 'आसान'], ['saral', 'સરળ']),
  w('Describing', 'difficult', 'moeilijk', 'difícil', ['mushkil', 'मुश्किल'], ['ḍukhyo', 'ڏکيو', 'ॾुखियो'], ['aghru', 'અઘરું']),
  w('Describing', 'right / correct', 'juist', 'correcto', ['sahi', 'सही'], ['sahi', 'صحيح', 'सही'], ['saachu', 'સાચું']),
  w('Describing', 'hungry', 'hongerig', 'hambriento', ['bhookha', 'भूखा'], ['bukhayal', 'بکايل', 'बुखायलु'], ['bhukhyo', 'ભૂખ્યો']),
  w('Describing', 'tired', 'moe', 'cansado', ['thaka', 'थका'], ['thakal', 'ٿڪل', 'थकलु'], ['thaakyo', 'થાક્યો']),
  w('Describing', 'expensive', 'duur', 'caro', ['mehenga', 'महँगा'], ['mahaango', 'مهانگو', 'महांगो'], ['monghu', 'મોંઘું']),
  w('Describing', 'cheap', 'goedkoop', 'barato', ['sasta', 'सस्ता'], ['sasto', 'سستو', 'सस्तो'], ['sastu', 'સસ્તું']),

  // Numbers
  w('Numbers', 'one', 'een', 'uno', ['ek', 'एक'], ['hiku', 'هڪ', 'हिकु'], ['ek', 'એક']),
  w('Numbers', 'two', 'twee', 'dos', ['do', 'दो'], ['ba', 'ٻه', 'ॿ'], ['be', 'બે']),
  w('Numbers', 'three', 'drie', 'tres', ['teen', 'तीन'], ['ṭe', 'ٽي', 'टे'], ['traṇ', 'ત્રણ']),
  w('Numbers', 'four', 'vier', 'cuatro', ['chaar', 'चार'], ['chaar', 'چار', 'चार'], ['chaar', 'ચાર']),
  w('Numbers', 'five', 'vijf', 'cinco', ['paanch', 'पाँच'], ['panj', 'پنج', 'पंज'], ['paanch', 'પાંચ']),
  w('Numbers', 'six', 'zes', 'seis', ['chhah', 'छह'], ['chha', 'ڇهه', 'छह'], ['chha', 'છ']),
  w('Numbers', 'seven', 'zeven', 'siete', ['saat', 'सात'], ['sata', 'ست', 'सत'], ['saat', 'સાત']),
  w('Numbers', 'eight', 'acht', 'ocho', ['aath', 'आठ'], ['aṭh', 'اٺ', 'अठ'], ['aath', 'આઠ']),
  w('Numbers', 'nine', 'negen', 'nueve', ['nau', 'नौ'], ['nava', 'نوَ', 'नव'], ['nav', 'નવ']),
  w('Numbers', 'ten', 'tien', 'diez', ['das', 'दस'], ['ḍaha', 'ڏهه', 'ॾह'], ['das', 'દસ']),

  // Added later: appended so earlier word ids (and saved progress) stay stable.
  w('Food & home', 'apple', 'appel', 'manzana', ['seb', 'सेब'], ['soofu', 'صوف', 'सूफ़ु'], ['safarjan', 'સફરજન']),
];

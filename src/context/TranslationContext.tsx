'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'ta' | 'hi';

interface Translations {
  [key: string]: {
    [key in Language]: string;
  };
}

const translations: Translations = {
  // Navbar
  'nav.products': { en: 'Products', ta: 'தயாரிப்புகள்', hi: 'उत्पाद' },
  'nav.about': { en: 'About Us', ta: 'எங்களைப் பற்றி', hi: 'हमारे बारे में' },
  'nav.contact': { en: 'Contact', ta: 'தொடர்பு', hi: 'संपर्क' },
  'nav.login': { en: 'Login', ta: 'உள்நுழை', hi: 'लॉगिन' },
  'nav.search': { en: 'Search for fresh harvest...', ta: 'புதிய அறுவடையைத் தேடுங்கள்...', hi: 'ताज़ा फसल खोजें...' },
  'nav.tagline': { en: 'Purely Organic', ta: 'முற்றிலும் இயற்கை', hi: 'शुद्ध जैविक' },
  'nav.profile': { en: 'My Profile', ta: 'என் சுயவிவரம்', hi: 'मेरी प्रोफाइल' },
  'nav.orders': { en: 'My Orders', ta: 'என் ஆர்டர்கள்', hi: 'मेरे आदेश' },
  'nav.addresses': { en: 'Saved Addresses', ta: 'சேமித்த முகவரிகள்', hi: 'सहेजे गए पते' },
  'nav.wallet': { en: 'FF Wallet', ta: 'எஃப்.எஃப் வாலட்', hi: 'एफएफ वॉलेट' },
  'nav.admin': { en: 'Admin Dashboard', ta: 'நிர்வாக டாஷ்போர்டு', hi: 'एडमिन डैशबोर्ड' },
  'nav.settings': { en: 'Settings', ta: 'அமைப்புகள்', hi: 'सेटिंग्स' },
  'nav.signout': { en: 'Sign Out', ta: 'வெளியேறு', hi: 'साइन आउट' },

  // Hero
  'hero.title': { en: 'Freshness Delivered', ta: 'புத்துணர்ச்சி விநியோகிக்கப்பட்டது', hi: 'ताजगी पहुंचाई गई' },
  'hero.subtitle': { en: 'From our farms to your doorstep in 24 hours.', ta: 'எங்கள் பண்ணைகளில் இருந்து உங்கள் வீட்டு வாசலுக்கு 24 மணிநேரத்தில்.', hi: 'हमारे खेतों से आपके घर तक 24 घंटों में।' },
  'hero.cta': { en: 'Shop Now', ta: 'இப்போது வாங்குங்கள்', hi: 'अभी खरीदें' },
  
  // Products
  'products.title': { en: 'Our Harvest', ta: 'எங்கள் அறுவடை', hi: 'हमारी फसल' },
  'products.filter': { en: 'Filter', ta: 'வடிகட்டி', hi: 'फिल्टर' },
  'products.categories': { en: 'Categories', ta: 'வகைகள்', hi: 'श्रेणियाँ' },
  'products.all': { en: 'All', ta: 'அனைத்தும்', hi: 'सब' },
  'products.fruits': { en: 'Fruits', ta: 'பழங்கள்', hi: 'फल' },
  'products.vegetables': { en: 'Vegetables', ta: 'காய்கறிகள்', hi: 'सब्जियाँ' },
  'products.hero.badge': { en: 'Premium Harvest Catalog', ta: 'பிரீமியம் அறுவடை பட்டியல்', hi: 'प्रीमियम फसल सूची' },
  'products.hero.title1': { en: 'Purely', ta: 'முற்றிலும்', hi: 'शुद्ध' },
  'products.hero.title2': { en: 'Organic', ta: 'இயற்கை', hi: 'जैविक' },
  'products.hero.title3': { en: 'Harvest', ta: 'அறுவடை', hi: 'फसल' },
  'products.hero.desc': { en: 'Experience the true taste of nature with our live products, harvested directly from our farms to your door.', ta: 'எங்கள் பண்ணைகளில் இருந்து நேரடியாக உங்கள் வீட்டு வாசலுக்கு அறுவடை செய்யப்பட்ட புதிய தயாரிப்புகளுடன் இயற்கையின் உண்மையான சுவையை அனுபவிக்கவும்.', hi: 'हमारे खेतों से सीधे आपके दरवाजे तक पहुंचाई गई ताजी फसलों के साथ प्रकृति के असली स्वाद का अनुभव करें।' },
  'products.certified.title': { en: 'Certified Quality', ta: 'சான்றளிக்கப்பட்ட தரம்', hi: 'प्रमाणित गुणवत्ता' },
  'products.certified.sub': { en: '100% Pesticide Free', ta: '100% பூச்சிக்கொல்லி இல்லாதது', hi: '100% कीटनाशक मुक्त' },
  'products.eco.title': { en: 'Eco Friendly', ta: 'சுற்றுச்சூழல் நட்பு', hi: 'पर्यावरण के अनुकूल' },
  'products.eco.sub': { en: 'Zero Waste Packaging', ta: 'பூஜ்ஜிய கழிவு பேக்கேஜிங்', hi: 'शून्य अपशिष्ट पैकेजिंग' },
  'products.sidebar.price': { en: 'Price Range', ta: 'விலை வரம்பு', hi: 'मूल्य सीमा' },
  'products.search.placeholder': { en: 'Search fresh products...', ta: 'புதிய தயாரிப்புகளைத் தேடுங்கள்...', hi: 'ताजे उत्पादों की खोज करें...' },
  'products.categories.seasonal': { en: 'Seasonal', ta: 'பருவகால', hi: 'मौसमी' },
  'products.categories.valluvam': { en: 'Valluvam Products', ta: 'வள்ளுவம் பொருட்கள்', hi: 'वल्लुवम उत्पाद' },
  
  // AI Assistant
  'ai.title': { en: 'Farm AI Guru', ta: 'பண்ணை AI குரு', hi: 'फार्म एआई गुरु' },
  'ai.ask': { en: 'Ask me anything...', ta: 'எது வேண்டுமானாலும் கேளுங்கள்...', hi: 'मुझसे कुछ भी पूछें...' },
  'ai.identify': { en: 'Identifying produce...', ta: 'தயாரிப்பை அடையாளம் காண்கிறது...', hi: 'उत्पाद की पहचान कर रहा है...' },

  // Hero Slider
  'hero.guaranteed': { en: 'Premium Quality Guaranteed', ta: 'பிரீமியம் தரம் உத்திரவாதம்', hi: 'प्रीमियम गुणवत्ता की गारंटी' },
  'hero.permanent.title': { en: 'Farmers Factory', ta: 'ஃபார்மர்ஸ் ஃபேக்டரி', hi: 'फार्मर्स फैक्ट्री' },
  'hero.permanent.subtitle': { en: 'Direct from the fields to your home. Harvesting purity, delivering health within 24 hours.', ta: 'வயல்களில் இருந்து நேரடியாக உங்கள் வீட்டிற்கு. தூய்மையை அறுவடை செய்து, 24 மணி நேரத்திற்குள் ஆரோக்கியத்தை வழங்குதல்.', hi: 'खेतों से सीधे आपके घर तक। शुद्धता की कटाई, 24 घंटे के भीतर स्वास्थ्य पहुँचाना।' },
  'hero.permanent.cta': { en: 'Shop Fresh Harvest', ta: 'புதிய அறுவடையை வாங்குங்கள்', hi: 'ताज़ा फसल खरीदें' },
  'hero.fruits.title': { en: 'Pure Organic Fruits', ta: 'தூய இயற்கை பழங்கள்', hi: 'शुद्ध जैविक फल' },
  'hero.fruits.subtitle': { en: 'Taste the sweetness of nature with our hand-picked 3D organic fruits, delivered fresh within 24 hours.', ta: '24 மணி நேரத்திற்குள் புதியதாக விநியோகிக்கப்படும் எங்களின் கையால் தேர்ந்தெடுக்கப்பட்ட 3D இயற்கை பழங்களுடன் இயற்கையின் இனிமையை சுவையுங்கள்.', hi: '24 घंटे के भीतर ताजा वितरित किए गए हमारे चुनिंदा 3D जैविक फलों के साथ प्रकृति की मिठास का स्वाद लें।' },
  'hero.fruits.cta': { en: 'Shop Fruits', ta: 'பழங்கள் வாங்குங்கள்', hi: 'फल खरीदें' },
  'hero.valluvam.title': { en: 'Traditional Valluvam', ta: 'பாரம்பரிய வள்ளுவம்', hi: 'पारंपरिक वल्लुवम' },
  'hero.valluvam.subtitle': { en: 'Experience the purity of ancient traditions with our curated Valluvam collection.', ta: 'எங்களின் தேர்ந்தெடுக்கப்பட்ட வள்ளுவம் சேகரிப்புடன் பண்டைய மரபுகளின் தூய்மையை அனுபவிக்கவும்.', hi: 'हमारे क्यूरेटेड वल्लुवम संग्रह के साथ प्राचीन परंपराओं की शुद्धता का अनुभव करें।' },
  'hero.valluvam.cta': { en: 'Explore Valluvam', ta: 'வள்ளுவத்தை ஆராயுங்கள்', hi: 'वल्लुवम का पता लगाएं' },

  // Delivery Strip
  'strip.free_delivery': { en: 'Free Delivery on orders above ₹499', ta: '₹499க்கு மேல் ஆர்டர் செய்தால் இலவச டெலிவரி', hi: '₹499 से अधिक के ऑर्डर पर मुफ्त डिलीवरी' },
  'strip.farm_to_table': { en: 'Delivered from Farm to Table in 24h', ta: 'பண்ணையிலிருந்து நேரடியாக 24 மணிநேரத்தில்', hi: '24 घंटे में खेत से सीधे मेज तक' },
  'strip.no_chemical': { en: 'No Chemical Ripening • Pure Organic', ta: 'ரசாயன பழுக்க வைப்பு இல்லை • முற்றிலும் இயற்கை', hi: 'कोई रासायनिक पकाना नहीं • शुद्ध जैविक' },
  'strip.zero_waste': { en: 'Zero Waste Packaging', ta: 'பூஜ்ஜிய கழிவு பேக்கேஜிங்', hi: 'शून्य अपशिष्ट पैकेजिंग' },

  // Featured Categories
  'categories.curated': { en: 'Curated Collections', ta: 'பிரத்தியேக தொகுப்புகள்', hi: 'विशेष संग्रह' },
  'categories.best_of': { en: "The Best of Nature's Harvest", ta: 'சிறந்த இயற்கையின் அறுவடை', hi: 'सर्वश्रेष्ठ प्रकृति की फसल' },
  'categories.desc': { en: 'Sustainably grown, hand-picked, and delivered with love from our farms to your doorstep within 24 hours.', ta: 'நிலையான முறையில் வளர்க்கப்பட்டு, கையால் தேர்ந்தெடுக்கப்பட்டு, எங்களின் பண்ணைகளிலிருந்து உங்கள் வீட்டு வாசலுக்கு 24 மணி நேரத்திற்குள் அன்புடன் விநியோகிக்கப்படுகிறது.', hi: 'टिकाऊ रूप से उगाया गया, हाथ से चुना गया, और हमारे खेतों से 24 घंटे के भीतर आपके दरवाजे तक प्यार से पहुँचाया गया।' },
  'categories.veg_count': { en: '20+ Varieties', ta: '20+ வகைகள்', hi: '20+ किस्में' },
  'categories.fruit_count': { en: '15+ Varieties', ta: '15+ வகைகள்', hi: '15+ किस्में' },
  'categories.val_count': { en: '10+ Essentials', ta: '10+ அத்தியாவசியங்கள்', hi: '10+ आवश्यक वस्तुएं' },

  // Featured Products
  'products.today_selection': { en: "Today's Selection", ta: 'இன்றைய தேர்வு', hi: 'आज का चयन' },
  'products.freshly_harvested': { en: 'Freshly Harvested', ta: 'புதிய அறுவடை', hi: 'ताज़ा कटी फसल' },
  'products.view_catalog': { en: 'View Full Catalog', ta: 'முழு பட்டியலையும் காண்க', hi: 'पूरा कैटलॉग देखें' },
  'products.loading': { en: "Gathering today's harvest...", ta: 'இன்றைய அறுவடையை சேகரிக்கிறது...', hi: 'आज की फसल इकट्ठी की जा रही है...' },

  // Why Choose Us
  'why.badge': { en: 'The Farmers Factory Difference', ta: 'ஃபார்மர்ஸ் ஃபேக்டரி வேறுபாடு', hi: 'फार्मर्स फैक्ट्री का अंतर' },
  'why.title': { en: 'Why We Are Better', ta: 'ஏன் நாங்கள் சிறந்தவர்கள்', hi: 'हम क्यों बेहतर हैं' },
  'why.desc': { en: 'We are not just a marketplace; we are a direct bridge between the soil and your soul.', ta: 'நாங்கள் வெறும் சந்தை அல்ல; மண்ணுக்கும் உங்கள் மனதுக்கும் இடையே ஒரு நேரடிப் பாலம்.', hi: 'हम केवल एक बाज़ार नहीं हैं; हम मिट्टी और आपकी आत्मा के बीच एक सीधा सेतु हैं।' },
  'why.organic.title': { en: '100% Organic', ta: '100% இயற்கை', hi: '100% जैविक' },
  'why.organic.desc': { en: 'Grown using traditional Vedic methods without any synthetic pesticides or fertilizers.', ta: 'செயற்கை பூச்சிக்கொல்லிகள் அல்லது உரங்கள் இல்லாமல் பாரம்பரிய வேத முறைகளைப் பயன்படுத்தி வளர்க்கப்படுகிறது.', hi: 'बिना किसी सिंथेटिक कीटनाशकों या उर्वरकों के पारंपरिक वैदिक तरीकों से उगाया गया।' },
  'why.delivery.title': { en: '24h Farm-to-Home', ta: '24 மணிநேர பண்ணை-வீடு', hi: '24 घंटे में खेत से घर' },
  'why.delivery.desc': { en: 'Harvested at dawn and delivered to your kitchen by dusk for maximum nutrient retention.', ta: 'அதிகபட்ச ஊட்டச்சத்து தக்கவைப்புக்காக அதிகாலையில் அறுவடை செய்யப்பட்டு அந்தி வேளையில் உங்கள் சமையலறைக்கு வழங்கப்படுகிறது.', hi: 'अधिकतम पोषक तत्वों के संरक्षण के लिए सुबह तड़के काटा गया और शाम तक आपकी रसोई तक पहुँचाया गया।' },
  'why.trace.title': { en: 'Traceable Origin', ta: 'கண்டுபிடிக்கக்கூடிய தோற்றம்', hi: 'पता लगाने योग्य मूल' },
  'why.trace.desc': { en: 'Scan any product to see exactly which farm it came from and when it was harvested.', ta: 'எந்தவொரு தயாரிப்பையும் ஸ்கேன் செய்து அது எந்தப் பண்ணையிலிருந்து வந்தது, எப்போது அறுவடை செய்யப்பட்டது என்பதைத் துல்லியமாகப் பார்க்கவும்.', hi: 'यह देखने के लिए किसी भी उत्पाद को स्कैन करें कि यह किस खेत से आया है और इसे कब काटा गया था।' },
  'why.farmer.title': { en: 'Farmer First', ta: 'விவசாயிக்கு முதலிடம்', hi: 'किसान पहले' },
  'why.farmer.desc': { en: 'Direct-to-consumer model ensuring fair pricing for our farmers and better value for you.', ta: 'எங்கள் விவசாயிகளுக்கு நியாயமான விலையையும் உங்களுக்கு சிறந்த மதிப்பையும் உறுதி செய்யும் நேரடி நுகர்வோர் மாதிரி.', hi: 'सीधे उपभोक्ता तक पहुँचने वाला मॉडल जिससे हमारे किसानों को उचित मूल्य और आपको बेहतर मूल्य मिले।' },

  // Farm Stories
  'stories.badge': { en: 'Live from the farm', ta: 'பண்ணையிலிருந்து நேரடி', hi: 'खेत से लाइव' },
  'stories.title': { en: 'Farm Stories', ta: 'பண்ணை கதைகள்', hi: 'खेत की कहानियाँ' },
  'stories.desc': { en: "Watch authentic moments directly from our farmers' fields.", ta: 'எங்கள் விவசாயிகளின் வயல்களில் இருந்து நேரடியாக உண்மையான தருணங்களைப் பாருங்கள்.', hi: 'हमारे किसानों के खेतों से सीधे वास्तविक पलों को देखें।' },

  // Live Streams
  'streams.badge': { en: '24/7 Live Transparency', ta: '24/7 நேரடி வெளிப்படைத்தன்மை', hi: '24/7 लाइव पारदर्शिता' },
  'streams.title': { en: 'WATCH YOUR HARVEST GROW', ta: 'உங்கள் அறுவடை வளர்வதைப் பாருங்கள்', hi: 'अपनी फसल को बढ़ते हुए देखें' },
  'streams.desc': { en: 'Real-time high-definition streams from our organic plots. Total transparency from soil to basket.', ta: 'எங்கள் இயற்கை திட்டுகளிலிருந்து நிகழ்நேர உயர் வரையறை நீரோடைகள். மண்ணிலிருந்து கூடை வரை முழு வெளிப்படைத்தன்மை.', hi: 'हमारे जैविक भूखंडों से वास्तविक समय की हाई-डेफिनिशन स्ट्रीम। मिट्टी से टोकरी तक पूर्ण पारदर्शिता।' },
  'streams.watching': { en: 'WATCHING', ta: 'பார்க்கிறார்கள்', hi: 'देख रहे हैं' },
  'streams.temp': { en: 'TEMP', ta: 'வெப்பநிலை', hi: 'तापमान' },
  'streams.humidity': { en: 'HUMIDITY', ta: 'ஈரப்பதம்', hi: 'आर्द्रता' },
  'streams.wind': { en: 'WIND', ta: 'காற்று', hi: 'हवा' },
  'streams.irrigation': { en: 'AUTO-IRRIGATION: ACTIVE', ta: 'தானியங்கி பாசனம்: செயலில்', hi: 'ऑटो-सिंचाई: सक्रिय' },

  // Footer
  'footer.basket_title_single': { en: 'You have 1 item ready for harvest', ta: 'உங்களிடம் 1 பொருள் அறுவடைக்கு தயாராக உள்ளது', hi: 'आपके पास कटाई के लिए 1 वस्तु तैयार है' },
  'footer.basket_title_plural': { en: 'You have {count} items ready for harvest', ta: 'உங்களிடம் {count} பொருட்கள் அறுவடைக்கு தயாராக உள்ளன', hi: 'आपके पास कटाई के लिए {count} वस्तुएं तैयार हैं' },
  'footer.basket_value': { en: 'Total Basket Value:', ta: 'மொத்த கூடை மதிப்பு:', hi: 'कुल टोकरी मूल्य:' },
  'footer.checkout': { en: 'Buy Now / Checkout', ta: 'இப்போது வாங்குங்கள் / செக்அவுட்', hi: 'अभी खरीदें / चेकआउट' },
  'footer.desc': { en: 'Bringing the goodness of nature directly to your doorstep. Organic, fresh, and sustainable harvest for your family.', ta: 'இயற்கையின் நன்மைகளை நேரடியாக உங்கள் வீட்டு வாசலுக்குக் கொண்டு சேர்ப்பது. உங்கள் குடும்பத்திற்கு கரிம, புதிய மற்றும் நிலையான அறுவடை.', hi: 'प्रकृति की अच्छाइयों को सीधे आपके दरवाजे तक पहुँचाना। आपके परिवार के लिए जैविक, ताजी और टिकाऊ फसल।' },
  'footer.items_in_basket': { en: 'Items in your basket', ta: 'உங்கள் கூடையில் உள்ள பொருட்கள்', hi: 'आपकी टोकरी में वस्तुएं' },
  'footer.copyright': { en: 'All Rights Reserved.', ta: 'அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.', hi: 'सर्वाधिकार सुरक्षित।' },

  // Categories & Explore
  'categories.explore': { en: 'Explore', ta: 'ஆராயுங்கள்', hi: 'खोजें' },
  'Vegetables': { en: 'Vegetables', ta: 'காய்கறிகள்', hi: 'सब्जियाँ' },
  'Fruits': { en: 'Fruits', ta: 'பழங்கள்', hi: 'फल' },
  'Valluvam Products': { en: 'Valluvam Products', ta: 'வள்ளுவம் பொருட்கள்', hi: 'வल्लुवम उत्पाद' },

  // Smart Search
  'search.placeholder': { en: 'Search for fresh harvest... try "Potato"', ta: 'புதிய அறுவடையைத் தேடுங்கள்... "உருளைக்கிழங்கு" என முயலவும்', hi: 'ताज़ा फसल खोजें... "आलू" आजमाएं' },
  'search.view_all': { en: 'View All Results', ta: 'அனைத்து முடிவுகளையும் காண்க', hi: 'सभी परिणाम देखें' },

  // Notification Drawer
  'notification.title': { en: 'Notifications', ta: 'அறிவிப்புகள்', hi: 'सूचनाएं' },
  'notification.realtime': { en: 'Real-time Updates', ta: 'நிகழ்நேர புதுப்பிப்புகள்', hi: 'वास्तविक समय अपडेट' },
  'notification.syncing': { en: 'Synchronizing alerts...', ta: 'அறிவிப்புகளை ஒத்திசைக்கிறது...', hi: 'सूचनाओं को सिंक किया जा रहा है...' },
  'notification.empty_title': { en: 'No new notifications', ta: 'புதிய அறிவிப்புகள் எதுவும் இல்லை', hi: 'कोई नई सूचना नहीं' },
  'notification.empty_desc': { en: "You're all caught up with the farm!", ta: 'பண்ணையின் அனைத்து தகவல்களையும் பெற்றுவிட்டீர்கள்!', hi: 'आप खेत के सभी समाचार जान चुके हैं!' },
  'notification.just_now': { en: 'Just now', ta: 'இப்போது', hi: 'अभी-अभी' },
  'notification.m_ago': { en: '{minutes}m ago', ta: '{minutes} நிமிடங்களுக்கு முன்', hi: '{minutes} मिनट पहले' },
  'notification.h_ago': { en: '{hours}h ago', ta: '{hours} மணிநேரத்திற்கு முன்', hi: '{hours} घंटे पहले' },

  // AI Assistant Panels
  'ai.version': { en: 'AI Guru v5.0', ta: 'AI குரு v5.0', hi: 'एआई गुरु v5.0' },
  'ai.smart_recipes': { en: 'Smart Recipes', ta: 'ஸ்மார்ட் சமையல் குறிப்புகள்', hi: 'स्मार्ट रेसिपी' },
  'ai.nutrition_planner': { en: 'Nutrition Planner', ta: 'ஊட்டச்சத்து திட்டமிடுபவர்', hi: 'पोषण योजनाकार' },
  'ai.health_guru': { en: 'Health Guru', ta: 'ஆரோக்கிய குரு', hi: 'स्वास्थ्य गुरु' },
  'ai.voice_ai': { en: 'Voice AI', ta: 'குரல் AI', hi: 'वॉयस एआई' },
  'ai.voice_orders': { en: 'Voice Orders', ta: 'குரல் ஆர்டர்கள்', hi: 'वॉयस ऑर्डर' },
  'ai.vernacular_enabled': { en: 'Vernacular AI Enabled', ta: 'வட்டார மொழி AI இயக்கப்பட்டது', hi: 'प्रादेशिक एआई सक्षम' },
  'ai.order_favorites': { en: 'Order favorites by voice...', ta: 'குரல் மூலம் பிடித்தவற்றை ஆர்டர் செய்யுங்கள்...', hi: 'आवाज द्वारा पसंदीदा ऑर्डर करें...' },
  'ai.sync_title': { en: 'Sync Your Body Data', ta: 'உங்கள் உடல் தரவை ஒத்திசைக்கவும்', hi: 'अपने शरीर का डेटा सिंक करें' },
  'ai.sync_desc': { en: 'Guru can analyze your sleep, activity, and vitals to suggest the perfect organic fuel for your week.', ta: 'உங்கள் வாரத்திற்கான சரியான உணவு முறையை பரிந்துரைக்க குரு உங்கள் தூக்கம், செயல்பாடு மற்றும் முக்கிய புள்ளிவிவரங்களை பகுப்பாய்வு செய்ய முடியும்.', hi: 'गुरु आपके सप्ताह के लिए सही भोजन का सुझाव देने के लिए आपकी नींद, गतिविधि और महत्वपूर्ण आंकड़ों का विश्लेषण कर सकता है।' },
  'ai.sync_btn': { en: 'Sync Health Apps', ta: 'ஆரோக்கிய செயலிகளை ஒத்திசைக்கவும்', hi: 'स्वास्थ्य ऐप्स सिंक करें' },
  'ai.synced_btn': { en: 'Body Data Synced', ta: 'உடல் தரவு ஒத்திசைக்கப்பட்டது', hi: 'शरीर का डेटा सिंक हो गया' },
  'ai.predictive_health': { en: 'Predictive Health', ta: 'முன்கணிப்பு ஆரோக்கியம்', hi: 'भविष्य कहनेवाला स्वास्थ्य' },
  'ai.weekly_planner': { en: 'Elite Weekly Planner', ta: 'வாராந்திர உணவு திட்டமிடுபவர்', hi: 'साप्ताहिक भोजन योजनाकार' },
  'ai.organic_fuel': { en: 'Organic Fuel', ta: 'இயற்கை உணவு', hi: 'जैविक आहार' },

  // Live Stream Locations / Fields
  '3D AI SPRINKLER SYSTEM': { en: '3D AI SPRINKLER SYSTEM', ta: '3D AI ஸ்பிரிங்க்ளர் அமைப்பு', hi: '3D AI स्प्रिंकलर सिस्टम' },
  'VEGGIE HARVEST A': { en: 'VEGGIE HARVEST A', ta: 'காய்கறி அறுவடை A', hi: 'सब्जी कटाई A' },
  'FRUIT HARVEST B': { en: 'FRUIT HARVEST B', ta: 'பழ அறுவடை B', hi: 'फल कटाई B' },
  'CENTER FIELD': { en: 'CENTER FIELD', ta: 'மைய வயல்', hi: 'मध्य क्षेत्र' },
  'NORTH FIELD': { en: 'NORTH FIELD', ta: 'வடக்கு வயல்', hi: 'उत्तरी क्षेत्र' },
  'EAST FIELD': { en: 'EAST FIELD', ta: 'கிழக்கு வயல்', hi: 'पूर्वी क्षेत्र' },

  // Dynamic Banner Literal Fallbacks
  'Organic Freshness': { en: 'Organic Freshness', ta: 'இயற்கை புத்துணர்ச்சி', hi: 'जैविक ताजगी' },
  'Fresh from our fields to your table.': { en: 'Fresh from our fields to your table.', ta: 'எங்கள் பண்ணைகளில் இருந்து உங்கள் மேசைக்கு புதியது.', hi: 'हमारे खेतों से आपकी मेज तक ताज़ा।' },
  'Explore More': { en: 'Explore More', ta: 'மேலும் ஆராயுங்கள்', hi: 'और खोजें' },
  'Farmers Factory': { en: 'Farmers Factory', ta: 'ஃபார்மர்ஸ் ஃபேக்டரி', hi: 'फार्मर्स फैक्ट्री' },
  'Direct from the fields to your home. Harvesting purity, delivering health within 24 hours.': { en: 'Direct from the fields to your home. Harvesting purity, delivering health within 24 hours.', ta: 'வயல்களில் இருந்து நேரடியாக உங்கள் வீட்டிற்கு. தூய்மையை அறுவடை செய்து, 24 மணி நேரத்திற்குள் ஆரோக்கியத்தை வழங்குதல்.', hi: 'खेतों से सीधे உங்கள் வீட்டு வாசலுக்கு (உங்களுக்காக) 24 மணி நேரத்திற்குள் ஆரோக்கியமான உணவு।' },
  'Shop Fresh Harvest': { en: 'Shop Fresh Harvest', ta: 'புதிய அறுவடையை வாங்குங்கள்', hi: 'ताज़ा फसल खरीदें' },
  'Pure Organic Fruits': { en: 'Pure Organic Fruits', ta: 'தூய இயற்கை பழங்கள்', hi: 'शुद्ध जैविक फल' },
  'Taste the sweetness of nature with our hand-picked 3D organic fruits, delivered fresh within 24 hours.': { en: 'Taste the sweetness of nature with our hand-picked 3D organic fruits, delivered fresh within 24 hours.', ta: '24 மணி நேரத்திற்குள் புதியதாக விநியோகிக்கப்படும் எங்களின் கையால் தேர்ந்தெடுக்கப்பட்ட 3D இயற்கை பழங்களுடன் இயற்கையின் இனிமையை சுவையுங்கள்.', hi: '24 घंटे के भीतर ताजा वितरित किए गए हमारे चुनिंदा 3D जैविक फलों के साथ प्रकृति की मिठास का स्वाद लें।' },
  'Shop Fruits': { en: 'Shop Fruits', ta: 'பழங்கள் வாங்குங்கள்', hi: 'फल खरीदें' },
  'Traditional Valluvam': { en: 'Traditional Valluvam', ta: 'பாரம்பரிய வள்ளுவம்', hi: 'पारंपरिक वल्लुवम' },
  'Experience the purity of ancient traditions with our curated Valluvam collection.': { en: 'Experience the purity of ancient traditions with our curated Valluvam collection.', ta: 'எங்களின் தேர்ந்தெடுக்கப்பட்ட வள்ளுவம் சேகரிப்புடன் பண்டைய மரபுகளின் தூய்மையை அனுபவிக்கவும்.', hi: 'हमारे क्यूरेटेड वल्लुवम संग्रह के साथ प्राचीन परंपराओं की शुद्धता का अनुभव करें।' },
  'Explore Valluvam': { en: 'Explore Valluvam', ta: 'வள்ளுவத்தை ஆராயுங்கள்', hi: 'वल्लुवम का पता लगाएं' },


  // Cart Page
  'cart.title': { en: 'Your Basket', ta: 'உங்கள் கூடை', hi: 'आपकी टोकरी' },
  'cart.loading': { en: 'Loading your harvest...', ta: 'உங்கள் அறுவடையை ஏற்றுகிறது...', hi: 'आपकी फसल लोड हो रही है...' },
  'cart.items_ready': { en: 'items ready for delivery', ta: 'பொருட்கள் விநியோகத்திற்கு தயார்', hi: 'वस्तुएं वितरण के लिए तैयार हैं' },
  'cart.add_more': { en: 'Add more items', ta: 'கூடுதல் பொருட்களைச் சேர்க்கவும்', hi: 'और वस्तुएं जोड़ें' },
  'cart.fresh_produce': { en: 'Fresh Produce', ta: 'புதிய தயாரிப்புகள்', hi: 'ताजा उत्पाद' },
  'cart.price': { en: 'Price', ta: 'விலை', hi: 'मूल्य' },
  'cart.free_del_guaranteed': { en: 'Free Delivery Guaranteed', ta: 'இலவச விநியோகம் உத்தரவாதம்', hi: 'मुफ्त डिलीवरी की गारंटी' },
  'cart.free_del_desc': { en: 'Your farm-fresh order will arrive within 24 hours at no extra cost.', ta: 'கூடுதல் கட்டணமின்றி 24 மணி நேரத்திற்குள் உங்கள் பண்ணை-புதிய ஆர்டர் வந்து சேரும்.', hi: 'बिना किसी अतिरिक्त शुल्क के आपका खेत से ताजा ऑर्डर 24 घंटे के भीतर पहुंच जाएगा।' },
  'cart.summary': { en: 'Order Summary', ta: 'ஆர்டர் சுருக்கம்', hi: 'ऑर्डर सारांश' },
  'cart.subtotal': { en: 'Subtotal', ta: 'துணைத்தொகை', hi: 'उप-योग' },
  'cart.discount': { en: 'Discount', ta: 'தள்ளுபடி', hi: 'छूट' },
  'cart.shipping': { en: 'Shipping', ta: 'விநியோகம்', hi: 'शिपिंग' },
  'cart.free': { en: 'Free', ta: 'இலவசம்', hi: 'मुफ्त' },
  'cart.grand_total': { en: 'Grand Total', ta: 'மொத்த தொகை', hi: 'कुल योग' },
  'cart.tax_inclusive': { en: 'Inclusive of all farm taxes', ta: 'அனைத்து பண்ணை வரிகளும் அடங்கும்', hi: 'सभी कृषि करों सहित' },
  'cart.checkout': { en: 'Checkout Now', ta: 'இப்போது செக்அவுட் செய்', hi: 'अभी चेकआउट करें' },
  'cart.promo': { en: 'Promotional Code', ta: 'விளம்பர குறியீடு', hi: 'प्रचार कोड' },
  'cart.enter_code': { en: 'ENTER CODE', ta: 'குறியீட்டை உள்ளிடவும்', hi: 'कोड दर्ज करें' },
  'cart.apply': { en: 'APPLY', ta: 'விண்ணப்பிக்கவும்', hi: 'लागू करें' },
  'cart.remove': { en: 'REMOVE', ta: 'நீக்கவும்', hi: 'हटाएं' },
  'cart.secure': { en: 'Secure Checkout', ta: 'பாதுகாப்பான செக்அவுட்', hi: 'सुरक्षित चेकआउट' },
  'cart.ssl': { en: 'SSL Encrypted Transaction', ta: 'SSL குறியாக்கப்பட்ட பரிவர்த்தனை', hi: 'एसएसएल एन्क्रिप्टेड लेनदेन' },
  'cart.support_desc': { en: "By supporting us, you're directly helping local farmers maintain sustainable agriculture.", ta: 'எங்களை ஆதரிப்பதன் மூலம், உள்ளூர் விவசாயிகள் நிலையான விவசாயத்தை பராமரிக்க நீங்கள் நேரடியாக உதவுகிறீர்கள்.', hi: 'हमारा समर्थन करके, आप सीधे स्थानीय किसानों को टिकाऊ कृषि बनाए रखने में मदद कर रहे हैं।' },
  'cart.empty_title': { en: 'Your harvest basket is currently empty', ta: 'உங்கள் அறுவடை கூடை தற்போது காலியாக உள்ளது', hi: 'आपकी फसल की टोकरी वर्तमान में खाली है' },
  'cart.empty_desc': { en: 'The fields are full of fresh produce waiting for you! Start shopping our seasonal collection now.', ta: 'வயல்கள் உங்களுக்காக புதிய தயாரிப்புகளால் நிறைந்துள்ளன! எங்களின் பருவகால சேகரிப்பை இப்போது வாங்கத் தொடங்குங்கள்.', hi: 'खेत ताजे उत्पादों से भरे हुए हैं जो आपका इंतजार कर रहे हैं! अभी हमारे मौसमी संग्रह की खरीदारी शुरू करें।' },
  'cart.start_shopping': { en: 'Start Shopping', ta: 'வாங்கத் தொடங்குங்கள்', hi: 'खरीदारी शुरू करें' },
  'cart.back_home': { en: 'Back to Home', ta: 'முகப்பு பக்கத்திற்கு', hi: 'होम पर वापस' },
  'cart.next_day': { en: 'Next Day Delivery', ta: 'அடுத்த நாள் விநியோகம்', hi: 'अगले दिन वितरण' },
  'cart.no_pesticides': { en: 'No pesticides ever', ta: 'பூச்சிக்கொல்லிகள் இல்லாதவை', hi: 'कभी कीटनाशक नहीं' },
  'cart.always_fresh': { en: 'Always fresh to your door', ta: 'எப்போதும் உங்கள் வாசலில் புதியதாக', hi: 'हमेशा आपके दरवाजे पर ताजा' },
  'cart.direct_farm': { en: 'Direct from Farm', ta: 'பண்ணையிலிருந்து நேரடியாக', hi: 'सीधे खेत से' },
  'cart.support_families': { en: 'Supporting local families', ta: 'உள்ளூர் குடும்பங்களுக்கு ஆதரவு', hi: 'स्थानीय परिवारों का समर्थन' },
  'cart.recommended': { en: 'Freshly Harvested for you', ta: 'உங்களுக்காக புதிதாக அறுவடை செய்யப்பட்டது', hi: 'आपके लिए ताज़ा कटी फसल' },
  'cart.recommended_desc': { en: 'Add these farm-fresh items to your basket', ta: 'இந்த பண்ணை-புதிய பொருட்களை உங்கள் கூடையில் சேர்க்கவும்', hi: 'इन खेत से ताजी वस्तुओं को अपनी टोकरी में जोड़ें' },
  'cart.view_all': { en: 'View All', ta: 'அனைத்தையும் காட்டு', hi: 'सभी देखें' },

  // Checkout Page
  'checkout.title': { en: 'Checkout', ta: 'செக்அவுட்', hi: 'चेकआउट' },
  'checkout.delivery_address': { en: 'Delivery Address', ta: 'விநியோக முகவரி', hi: 'डिलीवरी का पता' },
  'checkout.locating': { en: 'Locating...', ta: 'இருப்பிடத்தைக் கண்டறிகிறது...', hi: 'स्थान खोजा जा रहा है...' },
  'checkout.use_live': { en: 'Use Live Location', ta: 'நேரடி இருப்பிடத்தைப் பயன்படுத்துக', hi: 'लाइव स्थान का उपयोग करें' },
  'checkout.choose_saved': { en: '📍 Choose a Saved Delivery Location', ta: '📍 சேமித்த முகவரியைத் தேர்வு செய்யவும்', hi: '📍 सहेजे गए डिलीवरी पते का चयन करें' },
  'checkout.select_saved_placeholder': { en: '-- Select a Saved Location to Auto-fill --', ta: '-- தானாக நிரப்ப சேமித்த முகவரியைத் தேர்வுசெய்க --', hi: '-- ऑटो-फिल के लिए एक सहेजा गया पता चुनें --' },
  'checkout.fullname': { en: 'Full Name', ta: 'முழு பெயர்', hi: 'पूरा नाम' },
  'checkout.phone': { en: 'Phone Number', ta: 'தொலைபேசி எண்', hi: 'फ़ोन नंबर' },
  'checkout.street': { en: 'Street Address', ta: 'தெரு முகவரி', hi: 'गली का पता' },
  'checkout.city': { en: 'City', ta: 'நகரம்', hi: 'शहर' },
  'checkout.zip': { en: 'Zip Code', ta: 'அஞ்சல் குறியீடு', hi: 'पिन कोड' },
  'checkout.payment_method': { en: 'Payment Method', ta: 'கட்டண முறை', hi: 'भुगतान विधि' },
  'checkout.cod': { en: 'Cash on Delivery (COD)', ta: 'விநியோகத்தின் போது பணம் (COD)', hi: 'कैश ऑन डिलीवरी (COD)' },
  'checkout.cod_desc': { en: 'Pay when your farm goods arrive', ta: 'பொருட்கள் வரும்போது பணம் செலுத்துங்கள்', hi: 'सामान आने पर भुगतान करें' },
  'checkout.card': { en: 'Credit / Debit Card', ta: 'கிரெடிட் / டெபிட் கார்டு', hi: 'क्रेडिट / डेबिट कार्ड' },
  'checkout.card_desc': { en: 'Card payments will be available soon', ta: 'அட்டை கட்டணம் விரைவில் கிடைக்கும்', hi: 'कार्ड भुगतान जल्द ही उपलब्ध होगा' },
  'checkout.coming_soon': { en: 'Coming Soon', ta: 'விரைவில் வரும்', hi: 'जल्द ही आ रहा है' },
  'checkout.place_order': { en: 'Place Order', ta: 'ஆர்டர் செய்', hi: 'ऑर्डर करें' },
  'delivery.purity_lock': { en: 'Purity Lock', ta: 'தூய்மை பூட்டு', hi: 'शुद्धता लॉक' },
  'delivery.purity_desc': { en: 'All deliveries are made in temperature-controlled electric vehicles to maintain nutritional integrity.', ta: 'ஊட்டச்சத்து ஒருமைப்பாட்டைப் பராமரிக்க அனைத்து விநியோகங்களும் வெப்பநிலை கட்டுப்படுத்தப்பட்ட மின்சார வாகனங்களில் செய்யப்படுகின்றன.', hi: 'पोषण संबंधी अखंडता बनाए रखने के लिए सभी डिलीवरी तापमान-नियंत्रित इलेक्ट्रिक वाहनों में की जाती हैं।' },
  'delivery.zero_plastic': { en: 'Zero Plastic Packaging', ta: 'பூஜ்ஜிய பிளாஸ்டிக் பேக்கேஜிங்', hi: 'शून्य प्लास्टिक पैकेजिंग' },
  'delivery.faq': { en: 'Frequently Asked Questions', ta: 'அடிக்கடி கேட்கப்படும் கேள்விகள்', hi: 'अक्सर पूछे जाने वाले प्रश्न' },
  'delivery.q1': { en: 'What is the delivery charge?', ta: 'விநியோக கட்டணம் எவ்வளவு?', hi: 'डिलिवरी शुल्क क्या है?' },
  'delivery.a1': { en: 'Free delivery on orders above ₹499. For smaller baskets, a flat convenience fee of ₹29 applies.', ta: '₹499க்கு மேல் ஆர்டர் செய்தால் இலவச விநியோகம். சிறிய கூடைகளுக்கு, ₹29 வசூலிக்கப்படும்.', hi: '₹499 से अधिक के ऑर्डर पर मुफ्त डिलीवरी। छोटी टोकरियों के लिए ₹29 का शुल्क लागू होता है।' },
  'delivery.q2': { en: 'Do you deliver on Sundays?', ta: 'ஞாயிற்றுக்கிழமைகளில் விநியோகம் செய்கிறீர்களா?', hi: 'क्या आप रविवार को डिलीवरी करते हैं?' },
  'delivery.a2': { en: 'No, we do not deliver on Sundays. Our farmers, cows, and logistics teams rest on Sundays. All orders placed on Saturdays or Sundays are harvested fresh first thing Monday morning and delivered directly to your doorstep within 24 hours of harvest.', ta: 'இல்லை, ஞாயிற்றுக்கிழமைகளில் விநியோகம் செய்வதில்லை. எங்கள் விவசாயிகள், மாடுகள் மற்றும் குழுக்கள் ஞாயிற்றுக்கிழமைகளில் ஓய்வெடுக்கிறார்கள். சனி அல்லது ஞாயிற்றுக்கிழமைகளில் செய்யப்படும் ஆர்டர்கள் திங்கள் காலை புதிதாக அறுவடை செய்யப்பட்டு 24 மணி நேரத்திற்குள் விநியோகிக்கப்படும்.', hi: 'नहीं, हम रविवार को डिलीवरी नहीं करते हैं। हमारे किसान और टीमें रविवार को आराम करते हैं। शनिवार या रविवार को दिए गए सभी ऑर्डर सोमवार सुबह ताज़ा काटे जाते हैं और 24 घंटे के भीतर डिलीवर किए जाते हैं।' },
  'delivery.q3': { en: 'How can I track my order?', ta: 'எனது ஆர்டரை எவ்வாறு கண்காணிப்பது?', hi: 'मैं अपने ऑर्डर को कैसे ट्रैक कर सकता हूं?' },
  'delivery.a3': { en: "Once your harvest is dispatched, you'll receive a WhatsApp update with a live tracking link to our electric delivery fleet.", ta: 'உங்கள் ஆர்டர் அனுப்பப்பட்டதும், எங்களது மின்னணு விநியோக வாகனங்களின் நேரடி கண்காணிப்பு இணைப்புடன் வாட்ஸ்அப் புதுப்பிப்பைப் பெறுவீர்கள்.', hi: 'एक बार जब आपका ऑर्डर रवाना हो जाता है, तो आपको हमारे डिलीवरी वाहनों के लाइव ट्रैकिंग लिंक के साथ व्हाट्सएप अपडेट प्राप्त होगा।' },

  // Orders Page & Profile Orders
  'orders.title': { en: 'My Orders', ta: 'என் ஆர்டர்கள்', hi: 'मेरे आदेश' },
  'orders.desc': { en: 'Track and manage your farm-fresh deliveries.', ta: 'உங்கள் பண்ணை-புதிய விநியோகங்களைக் கண்காணித்து நிர்வகிக்கவும்.', hi: 'अपनी ताज़ा फसलों की डिलीवरी को ट्रैक और प्रबंधित करें।' },
  'orders.loading': { en: 'Loading your orders...', ta: 'உங்கள் ஆர்டர்களை ஏற்றுகிறது...', hi: 'आपके ऑर्डर लोड हो रहे हैं...' },
  'orders.empty': { en: 'No orders yet', ta: 'இதுவரை ஆர்டர்கள் இல்லை', hi: 'अभी तक कोई ऑर्डर नहीं' },
  'orders.empty_desc': { en: 'Ready to taste the freshness? Start your first order today!', ta: 'புத்துணர்ச்சியை சுவைக்க தயாரா? உங்கள் முதல் ஆர்டரை இன்றே தொடங்குங்கள்!', hi: 'ताजगी का स्वाद लेने के लिए तैयार हैं? अपना पहला ऑर्डर आज ही शुरू करें!' },
  'orders.id': { en: 'Order ID', ta: 'ஆர்டர் ஐடி', hi: 'ऑर्डर आईडी' },
  'orders.date': { en: 'Date Placed', ta: 'ஆர்டர் செய்த தேதி', hi: 'ऑर्डर देने की तिथि' },
  'orders.total': { en: 'Total Amount', ta: 'மொத்த தொகை', hi: 'कुल राशि' },
  'orders.status': { en: 'Status', ta: 'நிலை', hi: 'स्थिति' },
  'orders.view_details': { en: 'View Details', ta: 'விவரங்களைக் காண்க', hi: 'विवरण देखें' },
  'orders.item': { en: 'item', ta: 'பொருள்', hi: 'वस्तु' },
  'orders.items': { en: 'items', ta: 'பொருட்கள்', hi: 'वस्तुएं' },
  'orders.delivery_to': { en: 'Delivery To', ta: 'விநியோக முகவரி', hi: 'वितरण का स्थान' },
  'orders.track_delivery': { en: 'Track Delivery', ta: 'விநியோகத்தை கண்காணிக்கவும்', hi: 'वितरण ट्रैक करें' },
  'orders.coming_soon': { en: 'Coming Soon', ta: 'விரைவில்', hi: 'जल्द आ रहा है' },
  'orders.start_shopping': { en: 'Start Shopping', ta: 'வாங்குதலைத் தொடங்குங்கள்', hi: 'खरीदारी शुरू करें' },

  // Profile Page
  'profile.title': { en: 'My Profile', ta: 'என் சுயவிவரம்', hi: 'मेरी प्रोफाइल' },
  'profile.edit_profile': { en: 'Edit Profile', ta: 'சுயவிவரத்தைத் திருத்து', hi: 'प्रोफ़ाइल संपादित करें' },
  'profile.logout': { en: 'Logout', ta: 'வெளியேறு', hi: 'लॉगआउट' },
  'profile.your_orders': { en: 'Your Orders', ta: 'உங்கள் ஆர்டர்கள்', hi: 'आपके ऑर्डर' },
  'profile.manage_recent': { en: 'Manage your recent farm-fresh deliveries', ta: 'உங்கள் பண்ணை-புதிய விநியோகங்களை நிர்வகிக்கவும்', hi: 'अपनी हालिया ताजा फसलों की डिलीवरी प्रबंधित करें' },
  'profile.no_orders': { en: 'No orders yet', ta: 'இதுவரை ஆர்டர்கள் இல்லை', hi: 'अभी तक कोई ऑर्डर नहीं' },
  'profile.when_shop': { en: 'When you shop from our farm, your orders will appear here.', ta: 'எங்கள் பண்ணையிலிருந்து நீங்கள் வாங்கும்போது, உங்கள் ஆர்டர்கள் இங்கே தோன்றும்.', hi: 'जब आप हमारे खेत से खरीदारी करेंगे, तो आपके ऑर्डर यहां दिखाई देंगे।' },
  'profile.start_shopping': { en: 'Start Shopping', ta: 'வாங்குதலைத் தொடங்குங்கள்', hi: 'खरीदारी शुरू करें' },
  'profile.your_inbox': { en: 'Your Inbox', ta: 'உங்கள் உள்பெட்டி', hi: 'आपका इनबॉक्स' },
  'profile.updates_news': { en: 'Updates, order status, and farm news', ta: 'புதுப்பிப்புகள், ஆர்டர் நிலை மற்றும் பண்ணை செய்திகள்', hi: 'अपडेट, ऑर्डर की स्थिति और खेत के समाचार' },
  'profile.inbox_empty': { en: 'Inbox is empty', ta: 'உள்பெட்டி காலியாக உள்ளது', hi: 'इनबॉक्स खाली है' },
  'profile.will_receive': { en: 'You will receive order updates and important notifications here.', ta: 'ஆர்டர் புதுப்பிப்புகள் மற்றும் முக்கிய அறிவிப்புகளை இங்கே பெறுவீர்கள்.', hi: 'आपको ऑर्डर अपडेट और महत्वपूर्ण सूचनाएं यहां प्राप्त होंगी।' },
  'profile.wallet': { en: 'FF Wallet', ta: 'எஃப்.எஃப் வாலட்', hi: 'एफएफ वॉलेट' },
  'profile.rewards_loyalty': { en: 'Your rewards and loyalty earnings', ta: 'உங்கள் வெகுமதிகள் மற்றும் விசுவாச வருவாய்கள்', hi: 'आपके पुरस्कार और वफादारी की कमाई' },
  'profile.saved_addresses': { en: 'Saved Addresses', ta: 'சேமிக்கப்பட்ட முகவரிகள்', hi: 'सहेजे गए पते' },
  'profile.manage_locations': { en: 'Manage your delivery locations', ta: 'உங்கள் விநியோக இடங்களை நிர்வகிக்கவும்', hi: 'अपने वितरण स्थानों को प्रबंधित करें' },
  'profile.favorites': { en: 'My Favorites', ta: 'என் பிடித்தவை', hi: 'मेरे पसंदीदा' },
  'profile.curated_list': { en: 'Your curated list of organic favorites', ta: 'உங்களுக்கு பிடித்த இயற்கை பொருட்களின் பட்டியல்', hi: 'जैविक पसंदीदा की आपकी क्यूरेटेड सूची' },
  'profile.no_favorites': { en: 'No favorites found', ta: 'பிடித்தவை எதுவும் இல்லை', hi: 'कोई पसंदीदा नहीं मिला' },
  'profile.tap_heart': { en: 'Tap the heart on products to save them for later.', ta: 'தயாரிப்புகளைப் பின்னர் சேமிக்க இதயக் குறியீட்டைத் தட்டவும்.', hi: 'बाद में सहेजने के लिए उत्पादों पर दिल के निशान को टैप करें।' },
  'profile.saved': { en: 'Saved', ta: 'சேமிக்கப்பட்டது', hi: 'सहेजा गया' },
  'profile.view_item': { en: 'View Item', ta: 'பொருளைக் காண்க', hi: 'वस्तु देखें' },
  'profile.help_support': { en: 'Help & Support', ta: 'உதவி & ஆதரவு', hi: 'सहायता और समर्थन' },
  'profile.online_help': { en: "We're here to help you 24/7", ta: 'உங்களுக்கு உதவ நாங்கள் எப்போதும் தயாராக இருக்கிறோம்', hi: 'हम यहां आपकी 24/7 मदद के लिए हैं' },
  'profile.chat_with_us': { en: 'Chat with us', ta: 'எங்களுடன் அரட்டையடிக்கவும்', hi: 'हमसे चैट करें' },
  'profile.chat_desc': { en: 'Our farm experts are online to help you.', ta: 'உங்களுக்கு உதவ எங்கள் பண்ணை நிபுணர்கள் ஆன்லைனில் உள்ளனர்.', hi: 'आपकी मदद के लिए हमारे विशेषज्ञ ऑनलाइन हैं।' },
  'profile.start_chat': { en: 'Start Chat', ta: 'அரட்டையைத் தொடங்குக', hi: 'चैट शुरू करें' },
  'profile.call_support': { en: 'Call Support', ta: 'ஆதரவை அழைக்கவும்', hi: 'कॉल सपोर्ट' },
  'profile.call_desc': { en: 'Give us a call for urgent issues.', ta: 'அவசர சிக்கல்களுக்கு எங்களை அழைக்கவும்.', hi: 'तत्काल समस्याओं के लिए हमें कॉल करें।' },
  'profile.request_call': { en: 'Request Call', ta: 'அழைப்பைக் கோரவும்', hi: 'कॉल का अनुरोध करें' },
  'profile.settings': { en: 'Profile Settings', ta: 'சுயவிவர அமைப்புகள்', hi: 'प्रोफ़ाइल सेटिंग्स' },
  'profile.update_identity': { en: 'Update your identity and preferences', ta: 'உங்கள் விவரங்கள் மற்றும் விருப்பங்களை மாற்றியமைக்கவும்', hi: 'अपनी पहचान और प्राथमिकताएं अपडेट करें' },
  'profile.fullname': { en: 'Full Name', ta: 'முழு பெயர்', hi: 'पूरा नाम' },
  'profile.phone': { en: 'Phone Number', ta: 'தொலைபேசி எண்', hi: 'फ़ोन नंबर' },
  'profile.email': { en: 'Email Address', ta: 'மின்னஞ்சல் முகவரி', hi: 'ईमेल पता' },
  'profile.save_changes': { en: 'Save Changes', ta: 'மாற்றங்களைச் சேமிக்கவும்', hi: 'परिवर्तन सहेजें' },
  'profile.price': { en: 'Price', ta: 'விலை', hi: 'कीमत' },
  'profile.unit': { en: 'Unit', ta: 'அலகு', hi: 'इकाई' },
  'profile.subtitle': { en: 'Manage your account, orders, and addresses.', ta: 'உங்கள் கணக்கு, ஆர்டர்கள் மற்றும் முகவரிகளை நிர்வகிக்கவும்.', hi: 'अपने खाते, ऑर्डर और पते प्रबंधित करें।' },
  'profile.tab.orders': { en: 'Orders', ta: 'ஆர்டர்கள்', hi: 'आर्डर' },
  'profile.tab.inbox': { en: 'Inbox', ta: 'உள்பெட்டி / செய்திகள்', hi: 'इनबॉक्स' },
  'profile.tab.wallet': { en: 'FF Wallet', ta: 'எஃப்.எஃப் வாலட்', hi: 'एफएफ वॉलेट' },
  'profile.tab.addresses': { en: 'Addresses', ta: 'முகவரிகள்', hi: 'पते' },
  'profile.tab.favorites': { en: 'Favorites', ta: 'பிடித்தவை', hi: 'पसंदीदा' },
  'profile.tab.help': { en: 'Help & Support', ta: 'உதவி மற்றும் ஆதரவு', hi: 'सहायता और समर्थन' },
  'profile.tab.settings': { en: 'Settings', ta: 'அமைப்புகள்', hi: 'सेटिंग्स' },

  // About Page
  'about.roots': { en: 'Our Roots & Values', ta: 'எங்கள் வேர்கள் மற்றும் மதிப்புகள்', hi: 'हमारी जड़ें और मूल्य' },
  'about.legacy': { en: 'Purely Organic Legacy', ta: 'முற்றிலும் இயற்கை மரபு', hi: 'शुद्ध जैविक विरासत' },
  'about.desc': { en: 'Farmers Factory was born from a simple promise: to reconnect people with the purity of nature. We bridge the gap between organic fields and your home, ensuring every harvest reaches you within 24 hours.', ta: 'விவசாயிகள் தொழிற்சாலை ஒரு எளிய வாக்குறுதியிலிருந்து பிறந்தது: மக்களை இயற்கையின் தூய்மையுடன் மீண்டும் இணைப்பது. கரிம வயல்களுக்கும் உங்கள் வீட்டிற்கும் இடையிலான இடைவெளை நாங்கள் குறைக்கிறோம், ஒவ்வொரு அறுவடையும் 24 மணி நேரத்திற்குள் உங்களை சென்றடைவதை உறுதிசெய்கிறோம்.', hi: 'फार्मर्स फैक्ट्री का जन्म एक साधारण वादे से हुआ था: लोगों को प्रकृति की शुद्धता से फिर से जोड़ना। हम जैविक खेतों और आपके घर के बीच की दूरी को पाटते हैं, यह सुनिश्चित करते हुए कि हर फसल 24 घंटे के भीतर आप तक पहुंचे।' },
  'about.farmers': { en: 'Verified Farmers', ta: 'சரிபார்க்கப்பட்ட விவசாயிகள்', hi: 'सत्यापित किसान' },
  'about.families': { en: 'Happy Families', ta: 'மகிழ்ச்சியான குடும்பங்கள்', hi: 'खुशहाल परिवार' },
  'about.certified': { en: 'Organic Certified', ta: 'இயற்கை சான்றளிக்கப்பட்டது', hi: 'जैविक प्रमाणित' },
  'about.delivery': { en: 'Farm to Home', ta: 'பண்ணையிலிருந்து வீட்டுக்கு', hi: 'खेत से घर' },
  'about.our': { en: 'Our', ta: 'எங்கள்', hi: 'हमारा' },
  'about.mission_only': { en: 'Mission', ta: 'குறிக்கோள்', hi: 'मिशन' },
  'about.mission': { en: 'Our Mission', ta: 'எங்கள் குறிக்கோள்', hi: 'हमारा मिशन' },
  'about.quote': { en: '"We don\'t just sell vegetables; we cultivate a healthier generation."', ta: '"நாங்கள் காயறிகளை மட்டும் விற்கவில்லை; ஆரோக்கியமான தலைமுறையை உருவாக்குகிறோம்."', hi: '"हम सिर्फ सब्जियां नहीं बेचते; हम एक स्वस्थ पीढ़ी का निर्माण करते हैं।"' },
  'about.transparency': { en: 'Transparency', ta: 'வெளிப்படைத்தன்மை', hi: 'पारदर्शिता' },
  'about.transparency.desc': { en: 'Watch your harvest grow through our 24/7 live farm streams. No secrets, just nature.', ta: 'எங்களின் 24/7 நேரடி பண்ணை ஒளிபரப்பு மூலம் உங்கள் அறுவடை வளர்வதைப் பாருங்கள். ரகசியங்கள் இல்லை, இயற்கை மட்டுமே.', hi: 'हमारी 24/7 लाइव फार्म स्ट्रीम के माध्यम से अपनी फसल को बढ़ते हुए देखें। कोई रहस्य नहीं, बस प्रकृति।' },
  'about.quality': { en: 'Quality Control', ta: 'தரக் கட்டுப்பாடு', hi: 'गुणवत्ता नियंत्रण' },
  'about.quality.desc': { en: 'Every product undergoes 15 rigorous purity tests before it is packed into your basket.', ta: 'ஒவ்வொரு தயாரிப்பும் உங்கள் கூடையில் அடைக்கப்படுவதற்கு முன்பு 15 கடுமையான தூய்மை சோதனைகளுக்கு உட்படுத்தப்படுகிறது.', hi: 'आपकी टोकरी में पैक होने से पहले प्रत्येक उत्पाद 15 कड़े शुद्धता परीक्षणों से गुजरता है।' },
  'about.empower': { en: 'Empowering Farmers', ta: 'விவசாயிகளை மேம்படுத்துதல்', hi: 'किसानों को सशक्त बनाना' },
  'about.empower.desc': { en: 'By eliminating middlemen, we ensure our farmers get 70% more than the market rate.', ta: 'இடைத்தரகர்களை ஒழிப்பதன் மூலம், எங்கள் விவசாயிகள் சந்தை விலையை விட 70% அதிகமாக பெறுவதை உறுதி செய்கிறோம்.', hi: 'बिचौलियों को खत्म करके, हम यह सुनिश्चित करते हैं कि हमारे किसानों को बाजार दर से 70% अधिक मिले।' },

  // Privacy Policy Page
  'privacy.title': { en: 'Privacy Policy', ta: 'தனியுரிமைக் கொள்கை', hi: 'गोपनीयता नीति' },
  'privacy.intro.title': { en: '1. Introduction', ta: '1. அறிமுகம்', hi: '1. परिचय' },
  'privacy.intro.desc': { en: 'Welcome to Farmers Factory. We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about our policy, or our practices with regards to your personal information, please contact us.', ta: 'விவசாயிகள் தொழிற்சாலைக்கு உங்களை வரவேற்கிறோம். உங்களது தனிப்பட்ட தகவல்களையும் உங்களது தனியுரிமையையும் பாதுகாக்க நாங்கள் கடமைப்பட்டுள்ளோம். எங்கள் கொள்கை அல்லது உங்கள் தனிப்பட்ட தகவல் தொடர்பான எங்கள் நடைமுறைகள் குறித்து ஏதேனும் கேள்விகள் இருந்தால், எங்களைத் தொடர்பு கொள்ளவும்.', hi: 'फार्मर्स फैक्ट्री में आपका स्वागत है। हम आपकी व्यक्तिगत जानकारी और आपकी गोपनीयता के अधिकार की रक्षा के लिए प्रतिबद्ध हैं। यदि हमारी नीति, या आपकी व्यक्तिगत जानकारी के संबंध में हमारी प्रथाओं के बारे में आपके कोई प्रश्न या चिंताएं हैं, तो कृपया हमसे संपर्क करें।' },
  'privacy.collect.title': { en: '2. Information We Collect', ta: '2. நாங்கள் சேகரிக்கும் தகவல்கள்', hi: '2. जानकारी जो हम एकत्र करते हैं' },
  'privacy.collect.desc': { en: 'We collect personal information that you provide to us such as name, address, contact information, passwords and security data, and payment information.', ta: 'பெயர், முகவரி, தொடர்புத் தகவல்கள், கடவுச்சொற்கள், பாதுகாப்புத் தரவுகள் மற்றும் கட்டணத் தகவல்கள் போன்ற நீங்கள் எங்களுக்கு வழங்கும் தனிப்பட்ட தகவல்களை நாங்கள் சேகரிக்கிறோம்.', hi: 'हम आपके द्वारा प्रदान की जाने वाली व्यक्तिगत जानकारी एकत्र करते हैं जैसे नाम, पता, संपर्क जानकारी, पासवर्ड और सुरक्षा डेटा, और भुगतान जानकारी।' },
  'privacy.use.title': { en: '3. How We Use Your Information', ta: '3. உங்கள் தகவல்களை எவ்வாறு பயன்படுத்துகிறோம்', hi: '3. हम आपकी जानकारी का उपयोग कैसे करते हैं' },
  'privacy.use.desc': { en: 'We use personal information collected via our Services for a variety of business purposes described below. We process your personal information for these purposes in reliance on our legitimate business interests, in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations.', ta: 'எங்கள் சேவைகளின் மூலம் சேகரிக்கப்பட்ட தனிப்பட்ட தகவல்களை பல்வேறு வணிக நோக்கங்களுக்காகப் பயன்படுத்துகிறோம். உங்களின் தனியுரிமை மற்றும் சம்மதத்துடன் சட்டப்பூர்வ கடமைகளுக்கு இணங்குவதற்கும் இந்தத் தகவலைப் பயன்படுத்துகிறோம்.', hi: 'हम नीचे वर्णित विभिन्न व्यावसायिक उद्देश्यों के लिए हमारी सेवाओं के माध्यम से एकत्र की गई व्यक्तिगत जानकारी का उपयोग करते हैं। हम आपकी सहमति से और/या हमारे कानूनी दायित्वों के अनुपालन के लिए आपके साथ अनुबंध करने या निष्पादित करने के लिए इन उद्देश्यों के लिए आपकी व्यक्तिगत जानकारी को संसाधित करते हैं।' },
  'privacy.share.title': { en: '4. Sharing Your Information', ta: '4. உங்கள் தகவல்களைப் பகிர்தல்', hi: '4. आपकी जानकारी साझा करना' },
  'privacy.share.desc': { en: 'We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill business obligations.', ta: 'சட்டங்களுக்கு இணங்கவும், உங்களுக்குச் சேவைகளை வழங்கவும், உங்கள் உரிமைகளைப் பாதுகாக்கவும் அல்லது வணிகக் கடமைகளை நிறைவேற்றவும் உங்கள் ஒப்புதலுடன் மட்டுமே நாங்கள் தகவல்களைப் பகிர்கிறோம்.', hi: 'हम केवल आपकी सहमति से, कानूनों का अनुपालन करने के लिए, आपको सेवाएं प्रदान करने के लिए, आपके अधिकारों की रक्षा करने के लिए, या व्यावसायिक दायित्वों को पूरा करने के लिए जानकारी साझा करते हैं।' },
  'privacy.rights.title': { en: '5. Your Privacy Rights', ta: '5. உங்கள் தனியுரிமை உரிமைகள்', hi: '5. आपके गोपनीयता अधिकार' },
  'privacy.rights.desc': { en: 'In some regions (like the EEA and UK), you have certain rights under applicable data protection laws. These may include the right (i) to request access and obtain a copy of your personal information, (ii) to request rectification or erasure; (iii) to restrict the processing of your personal information; and (iv) if applicable, to data portability.', ta: 'சில பிராந்தியங்களில், பொருந்தக்கூடிய தரவுப் பாதுகாப்புச் சட்டங்களின் கீழ் உங்களுக்கு சில உரிமைகள் உள்ளன. உங்களது தனிப்பட்ட தகவல்களைப் பார்வையிடவும், திருத்தவும் அல்லது நீக்கவும் நீங்கள் எங்களைக் கோரலாம்.', hi: 'कुछ क्षेत्रों में, आपके पास लागू डेटा सुरक्षा कानूनों के तहत कुछ अधिकार हैं। इनमें आपकी व्यक्तिगत जानकारी तक पहुंच का अनुरोध करने और उसकी एक प्रति प्राप्त करने का अधिकार, सुधार या विलोपन का अनुरोध करने का अधिकार शामिल हो सकता है।' },

  // Terms of Service Page
  'terms.title': { en: 'Terms of Service', ta: 'சேவை விதிமுறைகள்', hi: 'सेवा की शर्तें' },
  'terms.agreement.title': { en: '1. Agreement to Terms', ta: '1. விதிமுறைகளுக்கான உடன்பாடு', hi: '1. शर्तों से समझौता' },
  'terms.agreement.desc': { en: 'By accessing or using our website, you agree to be bound by these Terms of Service. If you do not agree to all of these terms, then you are prohibited from using the site and must discontinue use immediately.', ta: 'எங்கள் வலைத்தளத்தை அணுகுவதன் மூலம் அல்லது பயன்படுத்துவதன் மூலம், இந்த சேவை விதிமுறைகளுக்குக் கட்டுப்பட ஒப்புக்கொள்கிறீர்கள். இந்த விதிமுறைகளை ஏற்கவில்லை எனில், வலைத்தளத்தைப் பயன்படுத்துவதைத் தவிர்க்கவும்.', hi: 'हमारी वेबसाइट का उपयोग करके, आप इन सेवा की शर्तों से बंधे होने के लिए सहमत हैं। यदि आप इन सभी शर्तों से सहमत नहीं हैं, तो आपको साइट का उपयोग करने से प्रतिबंधित किया जाता है और इसका उपयोग तुरंत बंद कर देना चाहिए।' },
  'terms.property.title': { en: '2. Intellectual Property Rights', ta: '2. அறிவுசார் சொத்துரிமை', hi: '2. बौद्धिक संपदा अधिकार' },
  'terms.property.desc': { en: 'Unless otherwise indicated, the Site is our proprietary property and all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the Site and the trademarks, service marks, and logos contained therein are owned or controlled by us or licensed to us.', ta: 'வலைத்தளத்தின் அனைத்து குறியீடுகளும், வடிவமைப்புகளும், புகைப்படங்களும் மற்றும் முத்திரைகளும் எங்களுக்கே சொந்தமானது.', hi: 'जब तक अन्यथा संकेत न दिया जाए, साइट हमारी मालिकाना संपत्ति है और साइट पर सभी स्रोत कोड, डेटाबेस, कार्यक्षमता, सॉफ्टवेयर, वेबसाइट डिजाइन, ऑडियो, वीडियो, पाठ, तस्वीरें और ग्राफिक्स हमारे स्वामित्व या नियंत्रण में हैं।' },
  'terms.repr.title': { en: '3. User Representations', ta: '3. பயனர் பொறுப்புகள்', hi: '3. उपयोगकर्ता प्रतिनिधित्व' },
  'terms.repr.desc': { en: 'By using the Site, you represent and warrant that: (1) all registration information you submit will be true, accurate, current, and complete; (2) you will maintain the accuracy of such information and promptly update such registration information as necessary.', ta: 'வலைத்தளத்தைப் பயன்படுத்தும்போது: நீங்கள் வழங்கும் அனைத்துப் பதிவுத் தகவல்களும் உண்மையானதாகவும் துல்லியமானதாகவும் இருப்பதை உறுதிப்படுத்த வேண்டும்.', hi: 'साइट का उपयोग करके, आप प्रतिनिधित्व करते हैं और वारंट करते हैं कि: (1) आपके द्वारा सबमिट की गई सभी पंजीकरण जानकारी सत्य, सटीक, वर्तमान और पूर्ण होगी; (2) आप ऐसी जानकारी की सटीकता बनाए रखेंगे।' },
  'terms.activities.title': { en: '4. Prohibited Activities', ta: '4. தடைசெய்யப்பட்ட நடவடிக்கைகள்', hi: '4. निषिद्ध गतिविधियाँ' },
  'terms.activities.desc': { en: 'You may not access or use the Site for any purpose other than that for which we make the Site available. The Site may not be used in connection with any commercial endeavors except those that are specifically endorsed or approved by us.', ta: 'எங்கள் ஒப்புதல் இல்லாமல் வணிக ரீதியாகவோ அல்லது தவறான பயன்பாடுகளுக்காகவோ இந்த வலைத்தளத்தைப் பயன்படுத்தக்கூடாது.', hi: 'आप साइट का उपयोग उस उद्देश्य के अलावा किसी अन्य उद्देश्य के लिए नहीं कर सकते जिसके लिए हम साइट उपलब्ध कराते हैं। साइट का उपयोग व्यावसायिक प्रयासों के संबंध में नहीं किया जा सकता है।' },
  'terms.sunday.title': { en: '5. Delivery Policy & Sunday Rest', ta: '5. விநியோகக் கொள்கை & ஞாயிறு விடுமுறை', hi: '5. वितरण नीति और रविवार की छुट्टी' },
  'terms.sunday.desc': { en: 'We aim to deliver all organic products within 24 hours of harvest. Please note that we do not harvest or deliver on Sundays. Orders placed on Saturdays and Sundays will be harvested fresh and dispatched on Monday morning for delivery within 24 hours of harvest.', ta: 'அறுவடை செய்யப்பட்ட 24 மணி நேரத்திற்குள் அனைத்து தயாரிப்புகளையும் வழங்க முயற்சிக்கிறோம். ஞாயிற்றுக்கிழமைகளில் அறுவடை மற்றும் விநியோகம் இல்லை என்பதை நினைவில் கொள்க. சனி மற்றும் ஞாயிற்றுக்கிழமைகளில் செய்யப்படும் ஆர்டர்கள் திங்கள் அன்று விநியோகிக்கப்படும்.', hi: 'हम कटाई के 24 घंटे के भीतर सभी जैविक उत्पादों को वितरित करने का लक्ष्य रखते हैं। कृपया ध्यान दें कि हम रविवार को कटाई या वितरण नहीं करते हैं। शनिवार और रविवार को दिए गए ऑर्डर सोमवार सुबह वितरित किए जाएंगे।' },

  // Auth Page
  'auth.email_address': { en: 'Email Address', ta: 'மின்னஞ்சல் முகவரி', hi: 'ईमेल पता' },
  'auth.email_placeholder': { en: 'name@example.com', ta: 'name@example.com', hi: 'name@example.com' },
  'auth.password': { en: 'Password', ta: 'கடவுச்சொல்', hi: 'पासवर्ड' },
  'auth.forgot': { en: 'Forgot?', ta: 'மறந்துவிட்டதா?', hi: 'भूल गए?' },
  'auth.identity_verification': { en: 'Identity Verification', ta: 'அடையாள சரிபார்ப்பு', hi: 'पहचान सत्यापन' },
  'auth.security_check': { en: 'Security Check', ta: 'பாதுகாப்பு சோதனை', hi: 'सुरक्षा जांच' },
  'auth.profile_completion': { en: 'Profile Completion', ta: 'சுயவிவரம் நிறைவு', hi: 'प्रोफ़ाइल पूर्णता' },
  'auth.welcome_back': { en: 'Welcome Back', ta: 'நல்வரவு', hi: 'स्वागत हे' },
  'auth.create_account': { en: 'Create Account', ta: 'கணக்கை உருவாக்குங்கள்', hi: 'खाता बनाएं' },
  'auth.login_tab': { en: 'Login', ta: 'உள்நுழைவு', hi: 'लॉगिन' },
  'auth.join_tab': { en: 'Join', ta: 'இணையுங்கள்', hi: 'शामिल हों' },
  'auth.back_to_store': { en: 'Back to Store', ta: 'கடைக்குச் செல்லவும்', hi: 'दुकान पर वापस जाएं' },
  'auth.processing': { en: 'Processing...', ta: 'செயலாக்கப்படுகிறது...', hi: 'प्रक्रिया जारी है...' },
  'auth.sign_in': { en: 'Sign In', ta: 'உள்நுழைக', hi: 'साइन इन करें' },
  'auth.send_code': { en: 'Send Security Code', ta: 'பாதுகாப்பு குறியீட்டை அனுப்பவும்', hi: 'सुरक्षा कोड भेजें' },
  'auth.verify_email': { en: 'Verify your email', ta: 'உங்கள் மின்னஞ்சலைச் சரிபார்க்கவும்', hi: 'अपना ईमेल सत्यापित करें' },
  'auth.sent_code_desc': { en: "We've sent a 6-digit code to", ta: 'ஆறு இலக்க குறியீட்டை அனுப்பியுள்ளோம்', hi: 'हमने 6-अंकीय कोड भेजा है' },
  'auth.verify_btn': { en: 'Verify Code', ta: 'குறியீட்டைச் சரிபார்', hi: 'कोड सत्यापित करें' },
  'auth.verifying': { en: 'Verifying...', ta: 'சரிபார்க்கப்படுகிறது...', hi: 'सत्यापित किया जा रहा है...' },
  'auth.different_email': { en: 'Use different email', ta: 'வேறு மின்னஞ்சலைப் பயன்படுத்தவும்', hi: 'अलग ईमेल का उपयोग करें' },
  'auth.success': { en: 'Verification Successful', ta: 'சரிபார்ப்பு வெற்றிகரமாக முடிந்தது', hi: 'सत्यापन सफल रहा' },
  'auth.setup_profile': { en: "Now, let's set up your profile.", ta: 'இப்போது, உங்கள் சுயவிவரத்தை அமைக்கலாம்.', hi: 'अब, आपकी प्रोफ़ाइल सेट अप करें।' },
  'auth.fullname': { en: 'Full Name', ta: 'முழு பெயர்', hi: 'पूरा नाम' },
  'auth.phone': { en: 'Phone', ta: 'தொலைபேசி', hi: 'फ़ोन' },
  'auth.create_password': { en: 'Create Password', ta: 'கடவுச்சொல்லை உருவாக்கவும்', hi: 'पासवर्ड बनाएं' },
  'auth.pwd_placeholder': { en: 'At least 6 characters', ta: 'குறைந்தது 6 எழுத்துக்கள்', hi: 'कम से कम 6 वर्ण' },
  'auth.complete_reg': { en: 'Complete Registration', ta: 'பதிவை முடிக்கவும்', hi: 'पंजीकरण पूरा करें' },
  'auth.creating_acc': { en: 'Creating Account...', ta: 'கணக்கு உருவாக்கப்படுகிறது...', hi: 'खाता बनाया जा रहा है...' },

  // Product Listings & Details
  'products.no_matching': { en: 'No matching products', ta: 'பொருந்தும் தயாரிப்புகள் எதுவுமில்லை', hi: 'कोई मेल खाने वाले उत्पाद नहीं मिले' },
  'products.show_all': { en: 'Show All', ta: 'அனைத்தையும் காட்டு', hi: 'सभी दिखाएं' },

  // Product Card Keys
  'product.sold_out': { en: 'Sold Out', ta: 'விற்றுத் தீர்ந்தது', hi: 'बिक गया' },
  'product.seasonal': { en: 'Seasonal', ta: 'பருவகால', hi: 'मौसमी' },
  'product.low_stock': { en: 'Low Stock', ta: 'குறைந்த இருப்பு', hi: 'कम स्टॉक' },
  'product.favorite': { en: 'Favorite', ta: 'விருப்பமானது', hi: 'பசंदीदा' },
  'product.added': { en: 'ADDED!', ta: 'சேர்க்கப்பட்டது!', hi: 'जोड़ा गया!' },
  'product.added_to_basket': { en: 'to your harvest basket', ta: 'உங்கள் கூடையில் சேர்க்கப்பட்டது', hi: 'आपकी टोकरी में' },
  'product.view_cart': { en: 'View Cart', ta: 'கூடையைக் காட்டு', hi: 'कार्ट देखें' },
  'product.not_in_stock': { en: 'Not in Stock', ta: 'இருப்பிலில்லை', hi: 'स्टॉक में नहीं' },
  'product.add_to_basket': { en: 'Add to Basket', ta: 'கூடையில் சேர்க்கவும்', hi: 'टोकरी में डालें' },
  'product.login_required': { en: 'Please login to add items to your basket', ta: 'தயவுசெய்து கூடையில் பொருட்களைச் சேர்க்க உள்நுழையவும்', hi: 'कृपया अपनी टोकरी में सामान जोड़ने के लिए लॉगिन करें' },
  'product.save_amount': { en: 'Save ₹', ta: '₹ சேமிப்பு', hi: 'बचत ₹' },
  'product.details.home': { en: 'Home', ta: 'முகப்பு', hi: 'होम' },
  'product.details.shop': { en: 'Shop', ta: 'கடை', hi: 'दुकान' },
  'product.details.reviews': { en: 'Reviews', ta: 'மதிப்புரைகள்', hi: 'समीक्षाएं' },
  'product.details.ready_in_24h': { en: 'Ready in 24h', ta: '24 மணி நேரத்தில் தயார்', hi: '24 घंटे में तैयार' },
  'product.details.seasonal_fav': { en: 'Seasonal Favorite', ta: 'பருவகால விருப்பம்', hi: 'मौसमी पसंदीदा' },
  'product.details.save': { en: 'SAVE', ta: 'சேமிப்பு', hi: 'बचत' },
  'product.details.taxes_mrp': { en: 'Incl. of all taxes • M.R.P. includes all charges', ta: 'அனைத்து வரிகளும் உட்பட • M.R.P. அனைத்து கட்டணங்களையும் உள்ளடக்கியது', hi: 'सभी करों सहित • एम.आर.पी. में सभी शुल्क शामिल हैं' },
  'product.details.default_desc': { en: 'Freshly harvested, organic produce delivered straight to your home. No chemicals, no ripening agents, just pure nature.', ta: 'அறுவடை செய்யப்பட்ட புதிய தயாரிப்புகள் உங்கள் வீட்டிற்கு நேரடியாக விநியோகிக்கப்படும். ரசாயனங்கள் இல்லை, பழுக்க வைக்கும் முகவர்கள் இல்லை, தூய இயற்கை மட்டுமே.', hi: 'ताज़ी कटी हुई जैविक फ़सलें सीधे आपके घर पहुँचाई जाती हैं। कोई रसायन नहीं, कोई पकाने वाले एजेंट नहीं, बस शुद्ध प्रकृति।' },
  'product.details.available_offers': { en: 'Available Offers', ta: 'கிடைக்கும் சலுகைகள்', hi: 'उपलब्ध ऑफ़र' },
  'product.details.combo_savings': { en: 'Combo Savings', ta: 'கூட்டு சேமிப்பு', hi: 'कॉम्बो बचत' },
  'product.details.combo_desc': { en: 'Save 10% when you buy 2+ items from the same farm.', ta: 'ஒரே பண்ணையில் இருந்து 2 அல்லது அதற்கு மேற்பட்ட பொருட்களை வாங்கும்போது 10% சேமிக்கவும்.', hi: 'एक ही खेत से 2+ आइटम खरीदने पर 10% बचाएं।' },
  'product.details.first_order': { en: 'First Order', ta: 'முதல் ஆர்டர்', hi: 'पहला ऑर्डर' },
  'product.details.first_order_desc': { en: 'Get Free Delivery on your first harvest order over ₹499.', ta: '₹499க்கு மேல் உங்களது முதல் ஆர்டருக்கு இலவச விநியோகத்தைப் பெறுங்கள்.', hi: '₹499 से अधिक के अपने पहले ऑर्डर पर मुफ्त डिलीवरी पाएं।' },
  'product.details.select_weight': { en: 'Select Weight', ta: 'எடையைத் தேர்ந்தெடுக்கவும்', hi: 'वजन चुनें' },
  'product.details.add_to_basket': { en: 'ADD TO BASKET', ta: 'கூடையில் சேர்க்கவும்', hi: 'टोकरी में डालें' },
  'product.details.buy_now': { en: 'BUY IT NOW', ta: 'இப்போது வாங்குங்கள்', hi: 'अभी खरीदें' },
  'product.details.next_slot': { en: 'Next Slot', ta: 'அடுத்த விநியோக நேரம்', hi: 'अगला स्लॉट' },
  'product.details.next_slot_time': { en: 'Tomorrow 6 AM - 9 AM', ta: 'நாளை காலை 6 மணி - 9 மணி', hi: 'कल सुबह 6 बजे - 9 बजे' },
  'product.details.quality': { en: 'Quality', ta: 'தரம்', hi: 'गुणवत्ता' },
  'product.details.grade_a': { en: 'Grade A Certified', ta: 'தர சான்றளிக்கப்பட்டது', hi: 'ग्रेड ए प्रमाणित' },
  'product.details.fast_support': { en: 'Fast Support', ta: 'விரைவான ஆதரவு', hi: 'त्वरित सहायता' },
  'product.details.live_chat_247': { en: 'Live Chat 24/7', ta: 'நேரடி அரட்டை 24/7', hi: 'लाइव चैट 24/7' },
  'product.details.you_might_like': { en: 'You Might Also Like', ta: 'உங்களுக்கு இவை பிடிக்கலாம்', hi: 'आपको ये भी पसंद आ सकते हैं' },
  'product.details.success': { en: 'SUCCESS!', ta: 'வெற்றி!', hi: 'सफलता!' },
  'product.details.image_not_available': { en: 'Image not available', ta: 'படம் கிடைக்கவில்லை', hi: 'छवि उपलब्ध नहीं है' },
  'product.details.save_percent': { en: 'SAVE 20%', ta: '20% சேமிப்பு', hi: '20% बचत' },
  'product.details.view_ar': { en: 'View AR Digital Twin', ta: 'ஏஆர் டிஜிட்டல் ட்வின் காண்க', hi: 'एआर डिजिटल ट्विन देखें' },
  'product.details.shelf_life': { en: 'Shelf Life', ta: 'அடுக்கு ஆயுள்', hi: 'शेल्फ लाइफ' },
  'product.details.shelf_life_val': { en: '3-5 Days', ta: '3-5 நாட்கள்', hi: '3-5 दिन' },
  'product.details.storage': { en: 'Storage', ta: 'சேமிப்பு', hi: 'भंडारण' },
  'product.details.storage_val': { en: 'Refrigerate', ta: 'குளிரூட்டவும்', hi: 'रेफ्रिजरेट करें' },
  'product.details.harvested_by': { en: 'Harvested By', ta: 'அறுவடை செய்தவர்', hi: 'कटाई की गई' },
  'product.details.verified_farmer': { en: 'Verified Organic Farmer', ta: 'சரிபார்க்கப்பட்ட இயற்கை விவசாயி', hi: 'सत्यापित जैविक किसान' },
  'product.details.one_time': { en: 'One-time Purchase', ta: 'ஒரு முறை வாங்குதல்', hi: 'एक बार की खरीद' },
  'product.details.subscribe_save': { en: 'Subscribe & Save', ta: 'சந்தா செலுத்தி சேமிக்கவும்', hi: 'सदस्यता लें और बचाएं' },
  'product.details.similar_harvest': { en: 'Similar Harvest', ta: 'ஒத்த அறுவடைகள்', hi: 'समान फसल' },
  'product.details.added': { en: 'ADDED!', ta: 'சேர்க்கப்பட்டது!', hi: 'जोड़ा गया!' },
  'product.details.added_to_harvest': { en: 'Successfully added to your harvest', ta: 'உங்கள் அறுவடையில் வெற்றிகரமாக சேர்க்கப்பட்டது', hi: 'सफलतापूर्वक आपकी फसल में जोड़ा गया' },
  'product.details.checkout_now': { en: 'Checkout Now', ta: 'இப்போது செக்அவுட் செய்யவும்', hi: 'अभी चेकआउट करें' },
  'product.details.continue_shopping': { en: 'Continue Shopping', ta: 'தொடர்ந்து ஷாப்பிங் செய்யவும்', hi: 'खरीदारी जारी रखें' },
  'product.details.signin_required': { en: 'Please sign in to buy now', ta: 'இப்போது வாங்க தயவுசெய்து உள்நுழையவும்', hi: 'अभी खरीदने के लिए कृपया साइन इन करें' },
  'product.details.added_desc': { en: 'Your harvest has been added to the basket', ta: 'உங்களது அறுவடை கூடையில் சேர்க்கப்பட்டது', hi: 'आपकी फसल टोकरी में जोड़ दी गई है' },
  'product.details.view_basket': { en: 'VIEW BASKET', ta: 'கூடையைக் காட்டு', hi: 'टोकरी देखें' },

  // Checkout Success
  'success.title': { en: 'Order Placed!', ta: 'ஆர்டர் செய்யப்பட்டது!', hi: 'ऑर्डर हो गया!' },
  'success.order_id': { en: 'Order ID:', ta: 'ஆர்டர் ஐடி:', hi: 'ऑर्डर आईडी:' },
  'success.thank_you': { en: 'Thank you for choosing Farmers Factory. Your fresh farm products will be delivered ', ta: 'ஃபார்மர்ஸ் ஃபேக்டரியைத் தேர்ந்தெடுத்ததற்கு நன்றி. உங்கள் புதிய பண்ணை தயாரிப்புகள் விநியோகிக்கப்படும் ', hi: 'फार्मर्स फैक्ट्री चुनने के लिए धन्यवाद। आपके ताजे कृषि उत्पाद वितरित किए जाएंगे ' },
  'success.within_24h': { en: 'within 24 hours', ta: '24 மணி நேரத்திற்குள்', hi: '24 घंटे के भीतर' },
  'success.track_order': { en: 'Track Your Order', ta: 'உங்கள் ஆர்டரைக் கண்காணிக்கவும்', hi: 'अपना ऑर्डर ट्रैक करें' },
  'success.continue_shopping': { en: 'Continue Shopping', ta: 'தொடர்ந்து வாங்கவும்', hi: 'खरीदारी जारी रखें' },

  // Order Details Page
  'order_details.back_to_account': { en: 'Back to Account', ta: 'கணக்கிற்குச் செல்லவும்', hi: 'खाते पर वापस' },
  'order_details.total_amount': { en: 'Total Amount', ta: 'மொத்த தொகை', hi: 'कुल राशि' },
  'order_details.items': { en: 'Items', ta: 'பொருட்கள்', hi: 'वस्तुएं' },
  'order_details.status': { en: 'Status', ta: 'நிலை', hi: 'स्थिति' },
  'order_details.completed': { en: 'Completed', ta: 'முடிந்தது', hi: 'पूरा हुआ' },
  'order_details.in_progress': { en: 'In Progress', ta: 'செயல்பாட்டில்', hi: 'प्रगति पर' },
  'order_details.invoice': { en: 'Invoice', ta: 'விலைப்பட்டியல்', hi: 'चालान' },
  'order_details.reorder_now': { en: 'Reorder Now', ta: 'மீண்டும் ஆர்டர் செய்', hi: 'अभी पुन: व्यवस्थित करें' },
  'order_details.delivery_tracking': { en: 'Delivery Tracking', ta: 'விநியோகக் கண்காணிப்பு', hi: 'डिलीवरी ट्रैकिंग' },
  'order_details.live_updates': { en: 'Live Updates', ta: 'நேரடி புதுப்பிப்புகள்', hi: 'लाइव अपडेट' },
  'order_details.delivery_partner': { en: 'Your Delivery Partner', ta: 'உங்கள் விநியோக கூட்டாளர்', hi: 'आपका डिलीवरी पार्टनर' },
  'order_details.chat': { en: 'Chat', ta: 'அரட்டை', hi: 'चैट' },
  'order_details.call': { en: 'Call', ta: 'அழைப்பு', hi: 'कॉल' },
  'order_details.fresh_harvest_pack': { en: 'Fresh Harvest Pack', ta: 'புதிய அறுவடை பேக்', hi: 'ताजा फसल पैक' },
  'order_details.varieties': { en: 'Varieties', ta: 'வகைகள்', hi: 'किस्में' },
  'order_details.browse_more': { en: 'Browse More', ta: 'மேலும் தேடுங்கள்', hi: 'और ब्राउज़ करें' },
  'order_details.direct_from_farm': { en: 'DIRECT FROM FARM', ta: 'பண்ணையிலிருந்து நேரடியாக', hi: 'सीधे खेत से' },
  'order_details.qty': { en: 'Qty', ta: 'அளவு', hi: 'मात्रा' },
  'order_details.rate_product': { en: 'Rate Product', ta: 'மதிப்பிடவும்', hi: 'उत्पाद को रेट करें' },
  'order_details.item_subtotal': { en: 'Item Subtotal', ta: 'பொருட்களின் துணைத்தொகை', hi: 'वस्तु उप-योग' },
  'order_details.farm_packaging': { en: 'Farm Packaging', ta: 'பண்ணை பேக்கேஜிங்', hi: 'खेत पैकेजिंग' },
  'order_details.logistics_delivery': { en: 'Logistics & Delivery', ta: 'லாஜிஸ்டிக்ஸ் & விநியோகம்', hi: 'रसद और वितरण' },
  'order_details.total_paid': { en: 'Total Paid', ta: 'மொத்தம் செலுத்தப்பட்டது', hi: 'कुल भुगतान' },
  'order_details.free': { en: 'FREE', ta: 'இலவசம்', hi: 'मुफ़्त' },
  'order_details.best_price_guaranteed': { en: 'Best Price Guaranteed', ta: 'சிறந்த விலை உத்தரவாதம்', hi: 'सर्वोत्तम मूल्य की गारंटी' },
  'order_details.you_saved': { en: 'You saved', ta: 'நீங்கள் சேமித்தது', hi: 'आपने बचाए' },
  'order_details.compared_market': { en: 'compared to local market prices.', ta: 'உள்ளூர் சந்தை விலைகளுடன் ஒப்பிடும்போது.', hi: 'स्थानीय बाजार कीमतों की तुलना में।' },
  'order_details.logistics_info': { en: 'Logistics Info', ta: 'தளவாட தகவல்', hi: 'रसद जानकारी' },
  'order_details.delivery_point': { en: 'Delivery Point', ta: 'விநியோக புள்ளி', hi: 'डिलीवरी बिंदु' },
  'order_details.home_primary': { en: 'Home (Primary)', ta: 'வீடு (முதன்மை)', hi: 'घर (प्राथमिक)' },
  'order_details.payment_meta': { en: 'Payment Meta', ta: 'கட்டண விவரம்', hi: 'भुगतान विवरण' },
  'order_details.method': { en: 'Method', ta: 'முறை', hi: 'तरीका' },
  'order_details.success_status': { en: 'SUCCESS', ta: 'வெற்றி', hi: 'सफल' },
  'order_details.help_center': { en: 'Help Center', ta: 'உதவி மையம்', hi: 'सहायता केंद्र' },
  'order_details.ai_support': { en: 'AI-Powered Support', ta: 'AI ஆதரவு', hi: 'एआई-संचालित सहायता' },
  'order_details.download_receipt': { en: 'Download Receipt', ta: 'ரசீதை பதிவிறக்கவும்', hi: 'रसीद डाउनलोड करें' },
  'order_details.get_gst_invoice': { en: 'Get GST Invoice', ta: 'ஜிஎஸ்டி விலைப்பட்டியல் பெறுக', hi: 'जीएसटी चालान प्राप्त करें' },
  'order_details.report_issue': { en: 'Report Quality Issue', ta: 'தரக் குறைபாட்டைப் புகாரளிக்கவும்', hi: 'गुणवत्ता समस्या की रिपोर्ट करें' },
  'order_details.instant_resolution': { en: 'Instant Resolution', ta: 'உடனடி தீர்வு', hi: 'त्वरित समाधान' },
  'order_details.request_return': { en: 'Request Return', ta: 'திரும்பப் பெறக் கோரவும்', hi: 'वापसी का अनुरोध करें' },
  'order_details.easy_returns': { en: 'Easy 7-day Returns', ta: 'எளிதான 7-நாள் வருவாய்', hi: 'आसान 7-दिवसीय वापसी' },
  'order_details.about_harvest': { en: 'About This Harvest', ta: 'இந்த அறுவடை பற்றி', hi: 'इस फसल के बारे में' },
  'order_details.know_farmer': { en: 'Know Your Farmer', ta: 'உங்கள் விவசாயியை அறிந்து கொள்ளுங்கள்', hi: 'अपने किसान को जानें' },
  'order_details.live_chat': { en: 'Live Chat', ta: 'நேரடி அரட்டை', hi: 'लाइव चैट' },
  'order_details.talk_expert': { en: 'TALK TO AN EXPERT', ta: 'நிபுணரிடம் பேசுங்கள்', hi: 'विशेषज्ञ से बात करें' },
  'order_details.print': { en: 'Print', ta: 'அச்சிடு', hi: 'प्रिंट' },
  'order_details.share': { en: 'Share', ta: 'பகிர்', hi: 'शेयर' },

  // Status steps
  'order_details.step.pending.label': { en: 'Order Placed', ta: 'ஆர்டர் செய்யப்பட்டது', hi: 'ऑर्डर दिया गया' },
  'order_details.step.pending.desc': { en: 'Your order has been received', ta: 'உங்கள் ஆர்டர் பெறப்பட்டது', hi: 'आपका ऑर्डर प्राप्त हो गया है' },
  'order_details.step.confirmed.label': { en: 'Order Confirmed', ta: 'ஆர்டர் உறுதி செய்யப்பட்டது', hi: 'ऑर्डर की पुष्टि हो गई' },
  'order_details.step.confirmed.desc': { en: 'Farmers have confirmed your order', ta: 'விவசாயிகள் உங்கள் ஆர்டரை உறுதிப்படுத்தியுள்ளனர்', hi: 'किसानों ने आपके ऑर्डर की पुष्टि कर दी है' },
  'order_details.step.processing.label': { en: 'Being Prepared', ta: 'தயாரிக்கப்படுகிறது', hi: 'तैयारी जारी है' },
  'order_details.step.processing.desc': { en: 'Fresh produce is being packed', ta: 'புதிய தயாரிப்புகள் பேக் செய்யப்படுகின்றன', hi: 'ताजा उत्पाद पैक किए जा रहे हैं' },
  'order_details.step.shipped.label': { en: 'Out for Delivery', ta: 'விநியோகத்திற்கு அனுப்பப்பட்டது', hi: 'डिलीवरी के लिए निकल गया' },
  'order_details.step.shipped.desc': { en: 'On the way to your doorstep', ta: 'உங்கள் வீட்டு வாசலுக்கு வரும் வழியில்', hi: 'आपके दरवाजे पर आने के रास्ते में' },
  'order_details.step.delivered.label': { en: 'Delivered', ta: 'விநியோகிக்கப்பட்டது', hi: 'वितरित' },
  'order_details.step.delivered.desc': { en: 'Delivered successfully!', ta: 'வெற்றிகரமாக விநியோகிக்கப்பட்டது!', hi: 'सफलतापूर्वक वितरित!' }
};

interface TranslationContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export function TranslationProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  // Persist language preference
  useEffect(() => {
    const saved = localStorage.getItem('ff_language') as Language;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (saved) setLanguage(saved);
  }, []);

  const changeLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('ff_language', lang);
  };

  const t = (key: string) => {
    return translations[key]?.[language] || key;
  };

  return (
    <TranslationContext.Provider value={{ language, setLanguage: changeLanguage, t }}>
      {children}
    </TranslationContext.Provider>
  );
}

export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (!context) throw new Error('useTranslation must be used within TranslationProvider');
  return context;
};


const venues = [
  // Bahçeli
  { id: 101, name: "Hisarönü Sütlü", category: "restoran", region: "Bahçelievler", discount: "%10", address: "Bahçelievler", lat: 39.921, lng: 32.822 },
  { id: 102, name: "Tabu Cafe", category: "kafe", region: "Bahçelievler", discount: "%15", address: "Bahçelievler", lat: 39.922, lng: 32.823 },
  { id: 103, name: "Coffee Prime", category: "kafe", region: "Bahçelievler", discount: "%30", address: "Tatlılarda geçerli", lat: 39.920, lng: 32.825 },
  { id: 104, name: "Ramen City", category: "restoran", region: "Bahçelievler", discount: "%30", address: "Bahçelievler", lat: 39.923, lng: 32.821 },
  { id: 105, name: "Cadillac Bilardo", category: "oyun", region: "Bahçelievler", discount: "%10", address: "Bahçelievler", lat: 39.924, lng: 32.824 },
  { id: 106, name: "Justo Sushi&Ramen", category: "restoran", region: "Bahçelievler", discount: "%15", address: "Bahçelievler", lat: 39.925, lng: 32.820 },
  { id: 107, name: "Soulmate", category: "kafe", region: "Bahçelievler", discount: "%20", address: "Bahçelievler", lat: 39.921, lng: 32.826 },
  { id: 108, name: "Justo", category: "restoran", region: "Bahçelievler", discount: "%15", address: "Bahçelievler", lat: 39.926, lng: 32.822 },
  { id: 109, name: "Papillion", category: "restoran", region: "Bahçelievler", discount: "Görüşülüyor", address: "Bahçelievler", lat: 39.927, lng: 32.823 },
  { id: 110, name: "Sumatra", category: "kafe", region: "Bahçelievler", discount: "%10", address: "Bahçelievler", lat: 39.922, lng: 32.828 },
  { id: 111, name: "Sunco", category: "kafe", region: "Bahçelievler", discount: "%20", address: "Bahçelievler", lat: 39.923, lng: 32.827 },
  { id: 112, name: "Fried Master", category: "restoran", region: "Bahçelievler", discount: "Görüşülüyor", address: "Bahçelievler", lat: 39.924, lng: 32.829 },
  { id: 113, name: "Pilav Üstü Aşk", category: "restoran", region: "Bahçelievler", discount: "%10", address: "Bahçelievler", lat: 39.924, lng: 32.821 },
  { id: 114, name: "Bowling Bahçeli", category: "oyun", region: "Bahçelievler", discount: "%10", address: "Bahçelievler", lat: 39.925, lng: 32.825 },
  { id: 115, name: "Espressocheck", category: "kafe", region: "Bahçelievler", discount: "%25", address: "Bahçelievler", lat: 39.920, lng: 32.829 },
  { id: 116, name: "Cafe Kangoo", category: "kafe", region: "Bahçelievler", discount: "Mevcut", address: "Bahçelievler", lat: 39.919, lng: 32.828 },
  { id: 117, name: "Midyeci Yasin", category: "restoran", region: "Bahçelievler", discount: "%10", address: "Bahçelievler", lat: 39.919, lng: 32.821 },

  // Tunalı
  { id: 201, name: "Pass Cafe", category: "kafe", region: "Tunalı", discount: "%20", address: "Tunalı", lat: 39.904, lng: 32.860 },
  { id: 202, name: "Dalyan Yemek & İçecek", category: "restoran", region: "Tunalı", discount: "%10", address: "Tunalı", lat: 39.905, lng: 32.861 },
  { id: 203, name: "Grandala Coffee", category: "kafe", region: "Tunalı", discount: "%10", address: "Tunalı", lat: 39.906, lng: 32.862 },
  { id: 204, name: "Rabarba Rooftop", category: "eglence", region: "Tunalı", discount: "%10", address: "Tunalı", lat: 39.903, lng: 32.859 },
  { id: 205, name: "Wurstwagen", category: "restoran", region: "Tunalı", discount: "%10", address: "Tunalı", lat: 39.907, lng: 32.863 },
  { id: 206, name: "Peron Pub", category: "eglence", region: "Tunalı", discount: "%10", address: "Tunalı", lat: 39.902, lng: 32.858 },
  { id: 207, name: "Coffee Bus", category: "kafe", region: "Tunalı", discount: "%20", address: "Tunalı", lat: 39.908, lng: 32.864 },
  { id: 208, name: "Mara Cafe", category: "kafe", region: "Tunalı", discount: "%20", address: "Tunalı", lat: 39.909, lng: 32.865 },
  { id: 209, name: "James Cook Pub", category: "eglence", region: "Tunalı", discount: "%10", address: "Tunalı", lat: 39.901, lng: 32.857 },
  { id: 210, name: "Hops", category: "eglence", region: "Tunalı", discount: "%20", address: "Tunalı", lat: 39.900, lng: 32.856 },
  { id: 211, name: "Tunalı Mackbear", category: "kafe", region: "Tunalı", discount: "%10", address: "Tunalı", lat: 39.910, lng: 32.866 },
  { id: 212, name: "Dexas Burger", category: "restoran", region: "Tunalı", discount: "%10", address: "Tunalı", lat: 39.911, lng: 32.867 },
  { id: 213, name: "Frydam Tunalı", category: "restoran", region: "Tunalı", discount: "%15", address: "Tunalı", lat: 39.912, lng: 32.868 },
  { id: 214, name: "Bay Baget Sandwich", category: "restoran", region: "Tunalı", discount: "%10", address: "Tunalı", lat: 39.913, lng: 32.869 },
  { id: 215, name: "Cozy Coffee Tunalı", category: "kafe", region: "Tunalı", discount: "%15", address: "Tunalı", lat: 39.914, lng: 32.870 },
  { id: 216, name: "Küçük İtalya", category: "restoran", region: "Tunalı", discount: "%10", address: "Tunalı", lat: 39.915, lng: 32.871 },

  // Emek
  { id: 301, name: "Pizza Bulls", category: "restoran", region: "Emek", discount: "%15", address: "Emek", lat: 39.918, lng: 32.825 },
  { id: 302, name: "Çakraz Piliç", category: "restoran", region: "Emek", discount: "%10", address: "Kart ödemelerinde geçerli", lat: 39.917, lng: 32.824 },
  { id: 303, name: "Emek Döner", category: "restoran", region: "Emek", discount: "%15", address: "Emek", lat: 39.916, lng: 32.823 },
  { id: 304, name: "Torian Art Cafe", category: "kafe", region: "Emek", discount: "Görüşülüyor", address: "Emek", lat: 39.915, lng: 32.826 },
  { id: 305, name: "Eklerci Murat", category: "restoran", region: "Emek", discount: "Mevcut", address: "Gimat şubesi", lat: 39.914, lng: 32.827 },
  { id: 306, name: "Tezgah Burger", category: "restoran", region: "Emek", discount: "%10", address: "Emek", lat: 39.915, lng: 32.822 },
  { id: 307, name: "Paper Roasting Coffee", category: "kafe", region: "Emek", discount: "Görüşülüyor", address: "Emek", lat: 39.913, lng: 32.828 },
  { id: 308, name: "Coffee Sheeper", category: "kafe", region: "Emek", discount: "%20", address: "Emek", lat: 39.914, lng: 32.821 },
  { id: 309, name: "Hamutçu", category: "restoran", region: "Emek", discount: "Mevcut", address: "Emek", lat: 39.912, lng: 32.825 },

  // Bilkent
  { id: 401, name: "Ast Cafe", category: "kafe", region: "Bilkent", discount: "%15", address: "Bilkent", lat: 39.866, lng: 32.748 },
  { id: 402, name: "Original Hot Dog & Kumpir", category: "restoran", region: "Bilkent", discount: "%10", address: "Bilkent", lat: 39.867, lng: 32.749 },
  { id: 403, name: "Bind Chocolate", category: "kafe", region: "Bilkent", discount: "%15", address: "Bilkent", lat: 39.868, lng: 32.750 },
  { id: 404, name: "Bilkent Basil", category: "restoran", region: "Bilkent", discount: "%15", address: "Bilkent", lat: 39.869, lng: 32.751 },
  { id: 405, name: "Petboo Petshop", category: "petshop", region: "Bilkent", discount: "%15", address: "Bilkent", lat: 39.870, lng: 32.752 },
  { id: 406, name: "Bilkent Cinevizyon", category: "eglence", region: "Bilkent", discount: "%15", address: "Bilkent", lat: 39.871, lng: 32.753 },
  { id: 407, name: "Coffee Bean Story", category: "kafe", region: "Bilkent", discount: "%15", address: "Bilkent", lat: 39.872, lng: 32.754 },
  { id: 408, name: "Meşhur Tepsi Mantısı", category: "restoran", region: "Bilkent", discount: "%15", address: "Bilkent", lat: 39.873, lng: 32.755 },

  // Kızılay
  { id: 501, name: "Madame Concept", category: "kafe", region: "Kızılay", discount: "%20", address: "Kızılay", lat: 39.919, lng: 32.854 },
  { id: 502, name: "Monopoly Café", category: "kafe", region: "Kızılay", discount: "%10", address: "Kızılay", lat: 39.920, lng: 32.855 },
  { id: 503, name: "La Parmesan", category: "restoran", region: "Kızılay", discount: "%20", address: "Kızılay", lat: 39.921, lng: 32.856 },
  { id: 504, name: "Coffee&Tea Shop Karanfil", category: "kafe", region: "Kızılay", discount: "%15", address: "Kızılay", lat: 39.922, lng: 32.857 },
  { id: 505, name: "Soi Coffee Matcha Bakery", category: "kafe", region: "Kızılay", discount: "%15", address: "Kızılay", lat: 39.923, lng: 32.858 },
  { id: 506, name: "Pavlu Coffee", category: "kafe", region: "Kızılay", discount: "%15", address: "Kızılay", lat: 39.924, lng: 32.859 },
  { id: 507, name: "Beyoğlu Makarnacısı", category: "restoran", region: "Kızılay", discount: "%15-20", address: "Kızılay", lat: 39.925, lng: 32.860 },
  { id: 508, name: "Ade Miel", category: "kafe", region: "Kızılay", discount: "%15", address: "Kızılay", lat: 39.926, lng: 32.861 },
  { id: 509, name: "Patavat", category: "kafe", region: "Kızılay", discount: "Mevcut", address: "Kızılay", lat: 39.927, lng: 32.862 },

  // Çayyolu
  { id: 601, name: "Alaturka Meze", category: "restoran", region: "Çayyolu", discount: "%20", address: "Çayyolu", lat: 39.888, lng: 32.695 },
  { id: 602, name: "L'Antica Pizzeria", category: "restoran", region: "Çayyolu", discount: "%15", address: "Çayyolu", lat: 39.889, lng: 32.696 },
  { id: 603, name: "Pizza House", category: "restoran", region: "Çayyolu", discount: "%15", address: "Çayyolu", lat: 39.890, lng: 32.697 },
  { id: 604, name: "Coffee Lab", category: "kafe", region: "Çayyolu", discount: "%20", address: "Çayyolu", lat: 39.891, lng: 32.698 },
  { id: 605, name: "Chill & Brew", category: "kafe", region: "Çayyolu", discount: "%15", address: "Çayyolu", lat: 39.892, lng: 32.699 },
  { id: 606, name: "Burger Sound", category: "restoran", region: "Çayyolu", discount: "%10", address: "Çayyolu", lat: 39.893, lng: 32.700 },
  { id: 607, name: "Tavuk Dünyası", category: "restoran", region: "Çayyolu", discount: "Mevcut", address: "Çayyolu", lat: 39.894, lng: 32.701 },
  { id: 608, name: "Pizzeria Corleone", category: "restoran", region: "Çayyolu", discount: "%10", address: "Çayyolu", lat: 39.895, lng: 32.702 },
  { id: 609, name: "Patara", category: "restoran", region: "Çayyolu", discount: "%10", address: "Çayyolu", lat: 39.896, lng: 32.703 },

  // Beytepe
  { id: 701, name: "Soulmate Beytepe", category: "kafe", region: "Beytepe", discount: "%20", address: "Beytepe", lat: 39.865, lng: 32.735 },
  { id: 702, name: "Coffee Lab Beytepe", category: "kafe", region: "Beytepe", discount: "%15", address: "Beytepe", lat: 39.866, lng: 32.736 },
  { id: 703, name: "Beytepe Simitçisi", category: "restoran", region: "Beytepe", discount: "%10", address: "Beytepe", lat: 39.867, lng: 32.737 },
  { id: 704, name: "Justo Beytepe", category: "restoran", region: "Beytepe", discount: "%15", address: "Beytepe", lat: 39.868, lng: 32.738 },
  { id: 705, name: "Burger Station Beytepe", category: "restoran", region: "Beytepe", discount: "%10", address: "Beytepe", lat: 39.869, lng: 32.739 },
  { id: 706, name: "Roast’n Brew", category: "kafe", region: "Beytepe", discount: "%15", address: "Beytepe", lat: 39.870, lng: 32.740 },
  { id: 707, name: "Pizza Locale Beytepe", category: "restoran", region: "Beytepe", discount: "%10", address: "Beytepe", lat: 39.871, lng: 32.741 },
  { id: 708, name: "Coffee Manifest Beytepe", category: "kafe", region: "Beytepe", discount: "%15", address: "Beytepe", lat: 39.872, lng: 32.742 },
  { id: 709, name: "Big Yellow Taxi Beytepe", category: "kafe", region: "Beytepe", discount: "%10", address: "Beytepe", lat: 39.873, lng: 32.743 },

  // Beştepe
  { id: 801, name: "Soulmate Beştepe", category: "kafe", region: "Beştepe", discount: "%20", address: "Beştepe", lat: 39.928, lng: 32.815 },
  { id: 802, name: "Coffee Lab Beştepe", category: "kafe", region: "Beştepe", discount: "%15", address: "Beştepe", lat: 39.929, lng: 32.816 },
  { id: 803, name: "Simitçi Dünyası Beştepe", category: "restoran", region: "Beştepe", discount: "%10", address: "Beştepe", lat: 39.930, lng: 32.817 },
  { id: 804, name: "Justo Beştepe", category: "restoran", region: "Beştepe", discount: "%15", address: "Beştepe", lat: 39.931, lng: 32.818 },
  { id: 805, name: "Burger King Beştepe", category: "restoran", region: "Beştepe", discount: "Mevcut", address: "Beştepe", lat: 39.932, lng: 32.819 },
  { id: 806, name: "Popeyes Beştepe", category: "restoran", region: "Beştepe", discount: "Mevcut", address: "Beştepe", lat: 39.933, lng: 32.820 },

  // Batıkent
  { id: 901, name: "Pizza Bulls Batıkent", category: "restoran", region: "Batıkent", discount: "%15", address: "Batıkent", lat: 39.965, lng: 32.725 },
  { id: 902, name: "Köfteci Yusuf Batıkent", category: "restoran", region: "Batıkent", discount: "Mevcut", address: "Batıkent", lat: 39.966, lng: 32.726 },
  { id: 903, name: "Tavuk Dünyası Batıkent", category: "restoran", region: "Batıkent", discount: "Mevcut", address: "Batıkent", lat: 39.967, lng: 32.727 },
  { id: 904, name: "Burger Station Batıkent", category: "restoran", region: "Batıkent", discount: "%10", address: "Batıkent", lat: 39.968, lng: 32.728 },
  { id: 905, name: "Soulmate Batıkent", category: "kafe", region: "Batıkent", discount: "%20", address: "Batıkent", lat: 39.969, lng: 32.729 },
  { id: 906, name: "Coffee Lab Batıkent", category: "kafe", region: "Batıkent", discount: "%15", address: "Batıkent", lat: 39.970, lng: 32.730 },

  // Ümitköy
  { id: 1001, name: "Coffee Lab Ümitköy", category: "kafe", region: "Ümitköy", discount: "%15", address: "Ümitköy", lat: 39.895, lng: 32.715 },
  { id: 1002, name: "Pizza Locale Ümitköy", category: "restoran", region: "Ümitköy", discount: "%10", address: "Ümitköy", lat: 39.896, lng: 32.716 },
  { id: 1003, name: "Justo Ümitköy", category: "restoran", region: "Ümitköy", discount: "%15", address: "Ümitköy", lat: 39.897, lng: 32.717 },
  { id: 1004, name: "Burger Station Ümitköy", category: "restoran", region: "Ümitköy", discount: "%10", address: "Ümitköy", lat: 39.898, lng: 32.718 },
  { id: 1005, name: "Soulmate Ümitköy", category: "kafe", region: "Ümitköy", discount: "%20", address: "Ümitköy", lat: 39.899, lng: 32.719 },
  { id: 1006, name: "Coffee Manifest Ümitköy", category: "kafe", region: "Ümitköy", discount: "%15", address: "Ümitköy", lat: 39.900, lng: 32.720 },

  // Koru
  { id: 1101, name: "Eren 2 Erkek Kuaförü", category: "hizmet", region: "Koru", discount: "%20", address: "450 TL üzeri alımlarda geçerli", lat: 39.885, lng: 32.685 }
];

console.log(JSON.stringify(venues));

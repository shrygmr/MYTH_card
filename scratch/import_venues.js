
const venues = [
  // Bahçeli
  { id: 101, name: "Hisarönü Sütlü", category: "restoran", region: "Bahçelievler", discount: "%10", address: "Bahçelievler", lat: 39.921, lng: 32.822 },
  { id: 102, name: "Tabu Cafe", category: "kafe", region: "Bahçelievler", discount: "%15", address: "Bahçelievler", lat: 39.922, lng: 32.823 },
  { id: 103, name: "Coffee Prime", category: "kafe", region: "Bahçelievler", discount: "%30", address: "Tatlılarda %30", lat: 39.920, lng: 32.825 },
  { id: 104, name: "Ramen City", category: "restoran", region: "Bahçelievler", discount: "%30", address: "Bahçelievler", lat: 39.923, lng: 32.821 },
  { id: 105, name: "Cadillac Bilardo", category: "oyun", region: "Bahçelievler", discount: "%10", address: "Bahçelievler", lat: 39.924, lng: 32.824 },
  { id: 106, name: "Justo Sushi&Ramen", category: "restoran", region: "Bahçelievler", discount: "%15", address: "Bahçelievler", lat: 39.925, lng: 32.820 },
  { id: 107, name: "Soulmate", category: "kafe", region: "Bahçelievler", discount: "%20", address: "Bahçelievler", lat: 39.921, lng: 32.826 },
  { id: 108, name: "Justo", category: "restoran", region: "Bahçelievler", discount: "%15", address: "Bahçelievler", lat: 39.926, lng: 32.822 },
  { id: 109, name: "Sumatra", category: "kafe", region: "Bahçelievler", discount: "%10", address: "Bahçelievler", lat: 39.922, lng: 32.828 },
  { id: 110, name: "Sunco", category: "kafe", region: "Bahçelievler", discount: "%20", address: "Bahçelievler", lat: 39.923, lng: 32.827 },
  { id: 111, name: "Pilav Üstü Aşk", category: "restoran", region: "Bahçelievler", discount: "%10", address: "Bahçelievler", lat: 39.924, lng: 32.821 },
  { id: 112, name: "Bowling Bahçeli", category: "oyun", region: "Bahçelievler", discount: "%10", address: "Bahçelievler", lat: 39.925, lng: 32.825 },
  { id: 113, name: "Espressocheck", category: "kafe", region: "Bahçelievler", discount: "%25", address: "Bahçelievler", lat: 39.920, lng: 32.829 },
  { id: 114, name: "Midyeci Yasin", category: "restoran", region: "Bahçelievler", discount: "%10", address: "Bahçelievler", lat: 39.919, lng: 32.821 },

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
  { id: 302, name: "Çakraz Piliç", category: "restoran", region: "Emek", discount: "%10", address: "Emek", lat: 39.917, lng: 32.824 },
  { id: 303, name: "Emek Döner", category: "restoran", region: "Emek", discount: "%15", address: "Emek", lat: 39.916, lng: 32.823 },
  { id: 304, name: "Tezgah Burger", category: "restoran", region: "Emek", discount: "%10", address: "Emek", lat: 39.915, lng: 32.822 },
  { id: 305, name: "Coffee Sheeper", category: "kafe", region: "Emek", discount: "%20", address: "Emek", lat: 39.914, lng: 32.821 }
];

console.log(JSON.stringify(venues));

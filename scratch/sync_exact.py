
import json

def sync_exact_venues():
    # EXCEL'DEN ALINAN GERÇEK LİSTE
    exact_venues = [
        # Bahçeli
        {"name": "Coffee Prime", "category": "kafe", "region": "Bahçelievler", "discount": "30", "lat": 39.9218, "lng": 32.8225, "address": "7. Cadde"},
        {"name": "Ramen City", "category": "restoran", "region": "Bahçelievler", "discount": "30", "lat": 39.9225, "lng": 32.8210, "address": "Bahçelievler"},
        {"name": "Espressocheck", "category": "kafe", "region": "Bahçelievler", "discount": "25", "lat": 39.9205, "lng": 32.8245, "address": "7. Cadde"},
        {"name": "Soulmate", "category": "kafe", "region": "Bahçelievler", "discount": "20", "lat": 39.9213, "lng": 32.8255, "address": "Bahçelievler"},
        {"name": "Sunco", "category": "kafe", "region": "Bahçelievler", "discount": "20", "lat": 39.9232, "lng": 32.8235, "address": "Bahçelievler"},
        {"name": "Tabu Cafe", "category": "kafe", "region": "Bahçelievler", "discount": "15", "lat": 39.9215, "lng": 32.8220, "address": "7. Cadde"},
        {"name": "Justo Sushi&Ramen", "category": "restoran", "region": "Bahçelievler", "discount": "15", "lat": 39.9240, "lng": 32.8215, "address": "Bahçelievler"},
        {"name": "Justo", "category": "restoran", "region": "Bahçelievler", "discount": "15", "lat": 39.9245, "lng": 32.8225, "address": "Bahçelievler"},
        {"name": "Hisarönü Sütlü", "category": "restoran", "region": "Bahçelievler", "discount": "10", "lat": 39.9210, "lng": 32.8230, "address": "Bahçelievler"},
        {"name": "Cadillac Bilardo", "category": "oyun", "region": "Bahçelievler", "discount": "10", "lat": 39.9235, "lng": 32.8250, "address": "Bahçelievler"},
        {"name": "Sumatra", "category": "kafe", "region": "Bahçelievler", "discount": "10", "lat": 39.9220, "lng": 32.8270, "address": "Bahçelievler"},
        {"name": "Pilav Üstü Aşk", "category": "restoran", "region": "Bahçelievler", "discount": "10", "lat": 39.9242, "lng": 32.8205, "address": "Bahçelievler"},
        {"name": "Bowling Bahçeli", "category": "oyun", "region": "Bahçelievler", "discount": "10", "lat": 39.9250, "lng": 32.8240, "address": "Bahçelievler"},
        {"name": "Midyeci Yasin", "category": "restoran", "region": "Bahçelievler", "discount": "10", "lat": 39.9195, "lng": 32.8220, "address": "7. Cadde"},

        # Tunalı
        {"name": "Pass Cafe", "category": "kafe", "region": "Tunalı", "discount": "20", "lat": 39.9055, "lng": 32.8605, "address": "Tunalı Hilmi Cad."},
        {"name": "Coffee Bus", "category": "kafe", "region": "Tunalı", "discount": "20", "lat": 39.9042, "lng": 32.8615, "address": "Tunalı Hilmi Cad."},
        {"name": "Mara Cafe", "category": "kafe", "region": "Tunalı", "discount": "20", "lat": 39.9065, "lng": 32.8625, "address": "Tunalı Hilmi Cad."},
        {"name": "Hops", "category": "eglence", "region": "Tunalı", "discount": "20", "lat": 39.9035, "lng": 32.8595, "address": "Tunalı"},
        {"name": "Frydam Tunalı", "category": "restoran", "region": "Tunalı", "discount": "15", "lat": 39.9075, "lng": 32.8635, "address": "Tunalı"},
        {"name": "Cozy Coffee Tunalı", "category": "kafe", "region": "Tunalı", "discount": "15", "lat": 39.9025, "lng": 32.8600, "address": "Tunalı"},
        {"name": "Dalyan Yemek & İçecek", "category": "restoran", "region": "Tunalı", "discount": "10", "lat": 39.9050, "lng": 32.8620, "address": "Tunalı"},
        {"name": "Grandala Coffee", "category": "kafe", "region": "Tunalı", "discount": "10", "lat": 39.9070, "lng": 32.8640, "address": "Tunalı"},
        {"name": "Rabarba Rooftop", "category": "eglence", "region": "Tunalı", "discount": "10", "lat": 39.9038, "lng": 32.8585, "address": "Tunalı Hilmi Cad."},
        {"name": "Wurstwagen", "category": "restoran", "region": "Tunalı", "discount": "10", "lat": 39.9080, "lng": 32.8650, "address": "Tunalı"},
        {"name": "Peron Pub", "category": "eglence", "region": "Tunalı", "discount": "10", "lat": 39.9015, "lng": 32.8575, "address": "Tunalı"},
        {"name": "James Cook Pub", "category": "eglence", "region": "Tunalı", "discount": "10", "lat": 39.9005, "lng": 32.8565, "address": "Tunalı"},
        {"name": "Tunalı Mackbear", "category": "kafe", "region": "Tunalı", "discount": "10", "lat": 39.9090, "lng": 32.8660, "address": "Tunalı Hilmi Cad."},
        {"name": "Dexas Burger", "category": "restoran", "region": "Tunalı", "discount": "10", "lat": 39.9095, "lng": 32.8670, "address": "Tunalı"},
        {"name": "Bay Baget Sandwich", "category": "restoran", "region": "Tunalı", "discount": "10", "lat": 39.9100, "lng": 32.8680, "address": "Tunalı"},
        {"name": "Küçük İtalya", "category": "restoran", "region": "Tunalı", "discount": "10", "lat": 39.9110, "lng": 32.8690, "address": "Tunalı Hilmi Cad."},

        # Beştepe (EKRAN GÖRÜNTÜSÜNDEN)
        {"name": "Tarihi Tencere Köfte", "category": "restoran", "region": "Beştepe", "discount": "20", "lat": 39.9320, "lng": 32.8150, "address": "Beştepe"},
        {"name": "Manja", "category": "kafe", "region": "Beştepe", "discount": "15-20", "lat": 39.9335, "lng": 32.8165, "address": "Beştepe"},
        {"name": "Mackbear Beştepe", "category": "kafe", "region": "Beştepe", "discount": "10", "lat": 39.9345, "lng": 32.8175, "address": "Beştepe"},
        {"name": "Vinozza", "category": "kafe", "region": "Beştepe", "discount": "10", "lat": 39.9355, "lng": 32.8185, "address": "Beştepe"},
        {"name": "Thai Curry", "category": "restoran", "region": "Beştepe", "discount": "10", "lat": 39.9365, "lng": 32.8195, "address": "Beştepe"},
        {"name": "Dubh Linn Pub", "category": "eglence", "region": "Beştepe", "discount": "Görüşülüyor", "lat": 39.9375, "lng": 32.8205, "address": "Beştepe"},
        {"name": "Coffe di Toee", "category": "kafe", "region": "Beştepe", "discount": "Görüşülüyor", "lat": 39.9385, "lng": 32.8215, "address": "Beştepe"},

        # Emek
        {"name": "Coffee Sheeper", "category": "kafe", "region": "Emek", "discount": "20", "lat": 39.9168, "lng": 32.8213, "address": "Bişkek Cad."},
        {"name": "Pizza Bulls Emek", "category": "restoran", "region": "Emek", "discount": "15", "lat": 39.9180, "lng": 32.8220, "address": "Emek"},
        {"name": "Emek Döner", "category": "restoran", "region": "Emek", "discount": "15", "lat": 39.9190, "lng": 32.8225, "address": "Emek"},
        {"name": "Tezgah Burger Emek", "category": "restoran", "region": "Emek", "discount": "10", "lat": 39.9200, "lng": 32.8230, "address": "Emek"},
        {"name": "Çakraz Piliç", "category": "restoran", "region": "Emek", "discount": "10-20", "lat": 39.9175, "lng": 32.8235, "address": "Emek"},

        # Kızılay
        {"name": "Madame Concept", "category": "kafe", "region": "Kızılay", "discount": "20", "lat": 39.9192, "lng": 32.8546, "address": "Kızılay"},
        {"name": "La Parmesan", "category": "restoran", "region": "Kızılay", "discount": "20", "lat": 39.9205, "lng": 32.8555, "address": "Kızılay"},
        {"name": "Coffee&tea Shop Karanfil", "category": "kafe", "region": "Kızılay", "discount": "15", "lat": 39.9198, "lng": 32.8565, "address": "Karanfil Sokak"},
        {"name": "Soi Coffee Matcha Bakery", "category": "kafe", "region": "Kızılay", "discount": "15", "lat": 39.9185, "lng": 32.8575, "address": "Kızılay"},
        {"name": "Pavlu Coffee", "category": "kafe", "region": "Kızılay", "discount": "15", "lat": 39.9215, "lng": "32.8585, address: Kızılay"},
        {"name": "Ade Miel", "category": "kafe", "region": "Kızılay", "discount": "15", "lat": 39.9225, "lng": 32.8595, "address": "Kızılay"},
        {"name": "Beyoğlu Makarnacısı", "category": "restoran", "region": "Kızılay", "discount": "15-20", "lat": 39.9200, "lng": 32.8535, "address": "Kızılay"},
        {"name": "Monopoly Café", "category": "kafe", "region": "Kızılay", "discount": "10", "lat": 39.9180, "lng": 32.8525, "address": "Kızılay"},

        # Keçiören
        {"name": "Eren 2 Erkek Kuaförü", "category": "hizmet", "region": "Keçiören", "discount": "20", "lat": 39.9750, "lng": 32.8650, "address": "Keçiören"},
        
        # Batıkent
        {"name": "Mikel Coffee", "category": "kafe", "region": "Batıkent", "discount": "5", "lat": 39.9650, "lng": 32.7250, "address": "Batıkent"}
    ]

    # Assign final IDs and format
    final_list = []
    for i, v in enumerate(exact_venues):
        v['id'] = 1000 + i
        v['description'] = v.get('description', '')
        v['popular'] = False
        v['isNew'] = False
        final_list.append(v)

    payload = {'fields': {'data': {'stringValue': json.dumps(final_list, ensure_ascii=False)}}}
    with open('/Users/apple/Desktop/481/myth_website/scratch/payload_exact.json', 'w', encoding='utf-8') as f:
        json.dump(payload, f, ensure_ascii=False)

sync_exact_venues()

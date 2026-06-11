# -*- coding: utf-8 -*-
import re

with open('profile.html', 'r', encoding='utf-8') as f:
    content = f.read()

cookshop_banner = '''
          <!-- Cookshop / Magnolia Shop Campaign Banner -->
          <div style="margin-top: 30px; border-radius: var(--radius-lg); overflow: hidden; border: 1px solid rgba(239,68,68,0.3);">
            <!-- Banner Header -->
            <div style="background: linear-gradient(135deg, #450a0a, #7f1d1d); padding: 20px 24px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 15px;">
              <div style="display: flex; align-items: center; gap: 15px;">
                <div style="background: linear-gradient(135deg, #EF4444, #B91C1C); width: 52px; height: 52px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; color: white; flex-shrink: 0; box-shadow: 0 4px 12px rgba(239,68,68,0.4);">
                  <i class="fas fa-utensils"></i>
                </div>
                <div>
                  <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
                    <h3 style="margin: 0; color: white; font-size: 1.1rem;">Cookshop & Magnolia Shop x MYTh</h3>
                    <span style="background: #10B981; color: white; font-size: 0.7rem; padding: 2px 8px; border-radius: 20px; font-weight: 700;">AKTİF</span>
                  </div>
                  <p style="margin: 0; color: rgba(255,255,255,0.7); font-size: 0.85rem;">
                    <i class="fas fa-calendar-alt" style="margin-right:4px;"></i>
                    Süresiz Kampanya
                  </p>
                </div>
              </div>
              <!-- Code Display -->
              <div style="text-align: center;">
                <div style="font-size: 0.75rem; color: rgba(255,255,255,0.6); margin-bottom: 6px; text-transform: uppercase; letter-spacing: 1px;">Kişisel İndirim Kodunuz</div>
                <div style="background: rgba(255,255,255,0.1); border: 2px dashed rgba(239,68,68,0.6); padding: 10px 20px; border-radius: 10px; display: flex; align-items: center; gap: 10px;">
                  <span id="pCookshopCode" style="font-size: 1.3rem; font-weight: 800; color: #F87171; letter-spacing: 3px; font-family: monospace;">YAKINDA...</span>
                  <button onclick="copyCookshopCode()" title="Kopyala" style="background:none; border:none; cursor:pointer; color: rgba(255,255,255,0.6); font-size:0.9rem; padding:2px;">
                    <i class="fas fa-copy" id="copyIconCs"></i>
                  </button>
                </div>
              </div>
            </div>

            <!-- Campaign Details -->
            <div style="background: rgba(69,10,10,0.5); padding: 16px 24px; border-top: 1px solid rgba(239,68,68,0.2);">
              <!-- Main Offer -->
              <div style="display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 14px;">
                <div style="background: rgba(239,68,68,0.15); border: 1px solid rgba(239,68,68,0.3); border-radius: 10px; padding: 10px 16px; flex: 1; min-width: 160px;">
                  <div style="font-size: 1.5rem; font-weight: 800; color: #F87171;">%20</div>
                  <div style="font-size: 0.8rem; color: rgba(255,255,255,0.7);">Tüm siparişlerde indirim (Seçili şubelerde)</div>
                </div>
              </div>

              <!-- Conditions Toggle -->
              <details style="cursor: pointer;">
                <summary style="color: rgba(255,255,255,0.7); font-size: 0.85rem; list-style: none; display: flex; align-items: center; gap: 6px; user-select: none;">
                  <i class="fas fa-info-circle" style="color: #F87171;"></i>
                  Kampanya koşullarını görüntüle
                  <i class="fas fa-chevron-down" style="margin-left: auto; font-size: 0.7rem;"></i>
                </summary>
                <ul style="margin: 10px 0 0 0; padding-left: 20px; color: rgba(255,255,255,0.6); font-size: 0.82rem; line-height: 1.7;">
                  <li><strong>Ankara Cookshop</strong> şubelerinde geçerlidir.</li>
                  <li><strong>İstanbul Magnolia Shop</strong> şubelerinde geçerlidir.</li>
                  <li>İndirimden yararlanmak için sipariş sırasında garsona <strong>Kişisel İndirim Kodunuzu</strong> iletmeniz gerekmektedir.</li>
                  <li>Kod tek kullanımlıktır.</li>
                </ul>
              </details>
            </div>
          </div>
'''

script_block = '''
          <script>
          function copyCookshopCode() {
            const code = document.getElementById('pCookshopCode').textContent.trim();
            if (!code || code === 'YAKINDA...' || code === 'YAKINDA EKLENECEK') return;
            navigator.clipboard.writeText(code).then(() => {
              const icon = document.getElementById('copyIconCs');
              icon.className = 'fas fa-check';
              icon.style.color = '#10B981';
              setTimeout(() => { icon.className = 'fas fa-copy'; icon.style.color = ''; }, 2000);
            });
          }
          </script>
'''

target = r'(</script>[\r\n\s]+<!-- Gamification Badges Section -->)'
replacement = '</script>\\n' + cookshop_banner + script_block + '\\n          <!-- Gamification Badges Section -->'

new_content = re.sub(target, replacement, content)
with open('profile.html', 'w', encoding='utf-8') as f:
    f.write(new_content)

print('Cookshop banner added!')

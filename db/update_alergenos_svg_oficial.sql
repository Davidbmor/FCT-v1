-- Actualizar SVGs de alérgenos - Símbolos simples estilo flat design

-- 1. Gluten (trigo)
UPDATE alergenos SET svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#FFA726" stroke="#F57C00" stroke-width="2"/><path d="M32 18v28M26 22c0-3 6-3 6 0v8c0 2-6 2-6 0v-8M26 34c0-2 6-2 6 0v6c0 2-6 2-6 0v-6M24 24h2M24 28h2M38 24h-2M38 28h-2M24 36h2M24 40h2M38 36h-2M38 40h-2" stroke="#FFF" stroke-width="2" fill="none" stroke-linecap="round"/></svg>' WHERE id = 1;

-- 2. Crustáceos
UPDATE alergenos SET svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#EF5350" stroke="#C62828" stroke-width="2"/><ellipse cx="24" cy="30" rx="5" ry="7" fill="#FFF"/><path d="M29 28h6c2 0 3 1 3 3v4c0 2-1 3-3 3h-6c-2 0-3-1-3-3v-4c0-2 1-3 3-3M16 24l6 4M16 28l6 3M16 32l6 2M48 24l-6 4M48 28l-6 3M48 32l-6 2M26 42l2 4M38 42l-2 4M24 20l2-4M26 22l2-3M38 22l-2-3M40 20l-2-4" stroke="#FFF" stroke-width="2" stroke-linecap="round" fill="none"/></svg>' WHERE id = 2;

-- 3. Huevos
UPDATE alergenos SET svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#FDD835" stroke="#F9A825" stroke-width="2"/><ellipse cx="32" cy="34" rx="10" ry="14" fill="#FFF" stroke="#FFF" stroke-width="2"/><path d="M22 28c0-8 6-12 10-12s10 4 10 12" stroke="#FFF" stroke-width="2" fill="none" stroke-linecap="round"/></svg>' WHERE id = 3;

-- 4. Pescado
UPDATE alergenos SET svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#42A5F5" stroke="#1976D2" stroke-width="2"/><path d="M18 32c0-6 8-8 14-8h8c4 0 8 2 10 4l6 4v8l-6 4c-2 2-6 4-10 4h-8c-6 0-14-2-14-8M38 28l8-6M38 36l8 6" stroke="#FFF" stroke-width="2" fill="none" stroke-linecap="round"/><circle cx="36" cy="30" r="2" fill="#FFF"/></svg>' WHERE id = 4;

-- 5. Cacahuetes
UPDATE alergenos SET svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#D4A574" stroke="#8D6E63" stroke-width="2"/><path d="M24 26c-3 2-4 6-4 10s1 8 4 10c2-2 3-5 3-8 0-2-1-4-2-6 1-2 2-4 2-6 0-3-1-6-3-8M40 26c3 2 4 6 4 10s-1 8-4 10c-2-2-3-5-3-8 0-2 1-4 2-6-1-2-2-4-2-6 0-3 1-6 3-8M27 30h10M27 38h10" stroke="#FFF" stroke-width="2" fill="none" stroke-linecap="round"/></svg>' WHERE id = 5;

-- 6. Soja
UPDATE alergenos SET svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#9CCC65" stroke="#689F38" stroke-width="2"/><path d="M22 28c-2 4-2 8 0 12l8 0c2-4 2-8 0-12zM42 28c-2 4-2 8 0 12l8 0c2-4 2-8 0-12z" stroke="#FFF" stroke-width="2" fill="none"/><ellipse cx="26" cy="34" rx="2" ry="4" fill="#FFF"/><ellipse cx="46" cy="34" rx="2" ry="4" fill="#FFF"/></svg>' WHERE id = 6;

-- 7. Lácteos
UPDATE alergenos SET svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#EEEEEE" stroke="#9E9E9E" stroke-width="2"/><rect x="24" y="20" width="16" height="4" rx="2" fill="#FFF" stroke="#FFF" stroke-width="1"/><path d="M26 24v20c0 2 1 4 3 4h6c2 0 3-2 3-4V24" stroke="#FFF" stroke-width="2.5" fill="none" stroke-linecap="round"/><rect x="27" y="16" width="10" height="4" rx="1" fill="#FFF"/></svg>' WHERE id = 7;

-- 8. Frutos con cáscara
UPDATE alergenos SET svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#8D6E63" stroke="#5D4037" stroke-width="2"/><circle cx="32" cy="34" r="12" stroke="#FFF" stroke-width="2" fill="none"/><path d="M26 22c2-4 4-6 6-6s4 2 6 6M28 20v8M32 18v10M36 20v8" stroke="#FFF" stroke-width="2" fill="none" stroke-linecap="round"/></svg>' WHERE id = 8;

-- 9. Apio
UPDATE alergenos SET svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#66BB6A" stroke="#388E3C" stroke-width="2"/><path d="M26 46V30c0-4-4-8-6-10M32 46V28c0-6 0-10 0-12M38 46V30c0-4 4-8 6-10M20 20c-2-2-1-4 0-6M32 16c-1-3 0-5 0-6M44 20c2-2 1-4 0-6" stroke="#FFF" stroke-width="2.5" fill="none" stroke-linecap="round"/><rect x="24" y="46" width="16" height="4" rx="2" fill="#FFF"/></svg>' WHERE id = 9;

-- 10. Mostaza
UPDATE alergenos SET svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#FFEB3B" stroke="#F57F17" stroke-width="2"/><path d="M32 48V28M26 34c-2-2-4-2-6 0-2 2 0 4 2 4 2 0 4-2 4-4M38 34c2-2 4-2 6 0 2 2 0 4-2 4-2 0-4-2-4-4M28 24c-2-2-4-2-6 0-2 2 0 4 2 4 2 0 4-2 4-4M36 24c2-2 4-2 6 0 2 2 0 4-2 4-2 0-4-2-4-4M32 18c-2-2-4-2-6 0-2 2 0 4 2 4 2 0 4-2 4-4" stroke="#FFF" stroke-width="1.5" fill="#FFF"/></svg>' WHERE id = 10;

-- 11. Sésamo
UPDATE alergenos SET svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#BCAAA4" stroke="#795548" stroke-width="2"/><ellipse cx="28" cy="22" rx="3" ry="4" fill="#FFF"/><ellipse cx="38" cy="26" rx="3" ry="4" fill="#FFF" transform="rotate(20 38 26)"/><ellipse cx="24" cy="32" rx="3" ry="4" fill="#FFF" transform="rotate(-10 24 32)"/><ellipse cx="34" cy="34" rx="3" ry="4" fill="#FFF"/><ellipse cx="42" cy="36" rx="3" ry="4" fill="#FFF" transform="rotate(15 42 36)"/><ellipse cx="28" cy="42" rx="3" ry="4" fill="#FFF" transform="rotate(-20 28 42)"/></svg>' WHERE id = 11;

-- 12. Sulfitos
UPDATE alergenos SET svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#AB47BC" stroke="#6A1B9A" stroke-width="2"/><text x="32" y="38" font-family="Arial,sans-serif" font-size="16" font-weight="bold" text-anchor="middle" fill="#FFF">SO₂</text></svg>' WHERE id = 12;

-- 13. Altramuces
UPDATE alergenos SET svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#26C6DA" stroke="#00838F" stroke-width="2"/><ellipse cx="32" cy="30" rx="8" ry="12" stroke="#FFF" stroke-width="2" fill="none"/><path d="M24 24c-2 2-2 4 0 6M40 24c2 2 2 4 0 6M24 36c-2-2-2-4 0-6M40 36c2-2 2-4 0-6M28 18v8M32 16v10M36 18v8" stroke="#FFF" stroke-width="2" fill="none" stroke-linecap="round"/><ellipse cx="32" cy="42" rx="5" ry="2" fill="#FFF"/></svg>' WHERE id = 13;

-- 14. Moluscos
UPDATE alergenos SET svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#FF7043" stroke="#D84315" stroke-width="2"/><path d="M20 30c0-8 5-12 12-12s12 4 12 12v8c0 8-5 12-12 12s-12-4-12-12z" stroke="#FFF" stroke-width="2" fill="none"/><line x1="32" y1="18" x2="32" y2="50" stroke="#FFF" stroke-width="2"/><path d="M24 26c2-2 3-2 4 0M36 26c2-2 3-2 4 0M24 34c2-2 3-2 4 0M36 34c2-2 3-2 4 0M24 42c2-2 3-2 4 0M36 42c2-2 3-2 4 0" stroke="#FFF" stroke-width="1.5" fill="none"/></svg>' WHERE id = 14;

# Playwright Project Patterns

This companion file provides practical patterns for this repository's crawler tasks.

## 1) 24h pattern hints

- Anchor around gold section/table text and row labels: `SJC`, `PNJ HÀ NỘI`.
- Update string pattern often includes: `Cập nhật lúc HH:mm (DD/MM/YYYY)`.

## 2) Kim Khánh Việt Hùng pattern hints

- Product row: `Vàng 999.9` under table columns `Mua vào`, `Bán ra`.
- Update text pattern: `Ngày cập nhật: DD/MM/YYYY HH:mm:ss`.

## 3) Hoa Kim Nguyên pattern hints

- Product row: `9999 vĩ`.
- Update text pattern: `Cập nhật vào lúc: HH:mm:ss, DD/MM/YYYY`.

## 4) Ngọc Thịnh pattern hints

- Product row: `Vàng 9999 (nhẫn tròn)`.
- Update text pattern: `CẬP NHẬT LÚC HH:mm DD/MM/YYYY`.

## 5) Numeric normalization reminders

- Remove thousand separators (`.` or `,` depending source context).
- Strip currency suffixes (`đ`, `VNĐ`, etc.).
- Preserve original raw value for debugging when parse fails.

## 6) Resilience reminders

- If one supplier fails, continue the run and emit `partial`.
- Retry navigation/parse with bounded attempts only.
- Always attempt notification with available successful items.
